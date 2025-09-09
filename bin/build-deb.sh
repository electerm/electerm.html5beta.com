#!/bin/bash

# Build script for creating Debian repository
# This script uses public as the root folder, public/deb as deb src folder

set -e

echo "Starting Debian repository build process..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_ROOT/public"
DEB_DIR="$PUBLIC_DIR/deb"

echo "Script directory: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo "Public directory: $PUBLIC_DIR"
echo "Deb directory: $DEB_DIR"

# Create proper Debian repository structure
mkdir -p "$DEB_DIR/dists/stable/main/binary-amd64"
mkdir -p "$DEB_DIR/pool/main/e/electerm"

echo "Repository structure created successfully"

# List the structure
echo "Repository structure:"
find "$DEB_DIR" -type d | sort

# Check for existing repository to prevent metadata conflicts
if [ -f "$DEB_DIR/dists/stable/main/binary-amd64/Packages" ]; then
    echo "Existing repository found, checking for version conflicts..."
    EXISTING_VERSION=$(grep "^Version:" "$DEB_DIR/dists/stable/main/binary-amd64/Packages" | head -1 | cut -d' ' -f2-)
    if [ -n "$EXISTING_VERSION" ] && [ -n "$RELEASE_TAG" ]; then
        # Extract version from release tag (remove 'v' prefix if present)
        NEW_VERSION="${RELEASE_TAG#v}-1"
        if [ "$EXISTING_VERSION" = "$NEW_VERSION" ]; then
            echo "Warning: Version $NEW_VERSION already exists in repository"
            echo "This may cause APT upgrade conflicts. Consider incrementing the debian revision."
        fi
    fi
fi

# Environment variables passed from the Node.js script
if [ -n "$DEB_ASSET_NAME" ] && ([ -n "$DEB_ASSET_URL" ] || [ -n "$DEB_FILE_PATH" ]); then
    echo "Found amd64 .deb asset: $DEB_ASSET_NAME"
    
    if [ -n "$DEB_FILE_PATH" ]; then
        # Use local file instead of downloading
        echo "Using local .deb file: $DEB_FILE_PATH"
        
        if [ ! -f "$DEB_FILE_PATH" ]; then
            echo "Error: Local .deb file not found at $DEB_FILE_PATH"
            exit 1
        fi
        
        # Copy the local file to the pool directory
        cp "$DEB_FILE_PATH" "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME"
        if [ $? -eq 0 ]; then
            echo "Successfully copied local file: $DEB_ASSET_NAME"
            echo "File size: $(stat -c%s "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME" 2>/dev/null || stat -f%z "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME") bytes"
        else
            echo "Failed to copy local file: $DEB_FILE_PATH"
            exit 1
        fi
    else
        # Download the .deb file to the pool directory
        echo "Downloading: $DEB_ASSET_NAME"
        echo "URL: $DEB_ASSET_URL"
        
        curl -L -o "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME" "$DEB_ASSET_URL"
        if [ $? -eq 0 ]; then
            echo "Successfully downloaded: $DEB_ASSET_NAME"
            echo "File size: $(stat -c%s "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME" 2>/dev/null || stat -f%z "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME") bytes"
        else
            echo "Failed to download: $DEB_ASSET_NAME"
            exit 1
        fi
    fi
        
        # Clean up old packages with the same version to prevent conflicts
        if [ -n "$RELEASE_TAG" ]; then
            NEW_VERSION="${RELEASE_TAG#v}-1"
            echo "Cleaning up any existing packages with version: $NEW_VERSION"
            find "$DEB_DIR/pool/main/e/electerm" -name "*${NEW_VERSION}*.deb" -delete 2>/dev/null || true
        fi
        
        # Generate Packages file in the proper location
        echo "Generating Packages file..."
        PACKAGES_DIR="$DEB_DIR/dists/stable/main/binary-amd64"
        PACKAGES_FILE="$PACKAGES_DIR/Packages"
        > "$PACKAGES_FILE"  # Clear the file
        
        # Process .deb files from the pool
        for deb_file in "$DEB_DIR/pool/main/e/electerm"/*.deb; do
            if [ -f "$deb_file" ]; then
                deb_basename=$(basename "$deb_file")
                echo "Processing package: $deb_basename"
                
                # Extract control file from the .deb package
                tmpdir=$(mktemp -d)
                dpkg-deb --control "$deb_file" "$tmpdir"
                
                # Read control file and extract ALL fields to preserve complete metadata
                if [ -f "$tmpdir/control" ]; then
                    # First, extract fields in the standard order for consistency
                    for field in Package Version License Vendor Architecture Maintainer Depends Recommends Suggests Conflicts Breaks Replaces Provides Section Priority Homepage; do
                        grep "^${field}:" "$tmpdir/control" >> "$PACKAGES_FILE" 2>/dev/null || true
                    done
                    
                    # Handle Installed-Size field specially - calculate if missing
                    if grep -q "^Installed-Size:" "$tmpdir/control"; then
                        grep "^Installed-Size:" "$tmpdir/control" >> "$PACKAGES_FILE"
                    else
                        # Calculate installed size from package data if missing
                        installed_size=$(dpkg-deb --info "$deb_file" | grep "^ size:" | awk '{print int($2/1024)}' 2>/dev/null || echo "unknown")
                        if [ "$installed_size" != "unknown" ]; then
                            echo "Installed-Size: $installed_size" >> "$PACKAGES_FILE"
                        fi
                    fi
                    
                    # Then add any remaining fields not already included
                    grep -v -E "^(Package|Version|License|Vendor|Architecture|Maintainer|Depends|Recommends|Suggests|Conflicts|Breaks|Replaces|Provides|Section|Priority|Homepage|Installed-Size):" "$tmpdir/control" >> "$PACKAGES_FILE" 2>/dev/null || true
                    
                    # Add consistent build date from release data to ensure metadata consistency
                    if [ -n "$RELEASE_DATE" ]; then
                        # Format the release date consistently
                        BUILD_DATE_FORMATTED=$(date -u -d "$RELEASE_DATE" '+%a, %d %b %Y %H:%M:%S UTC' 2>/dev/null || date -u '+%a, %d %b %Y %H:%M:%S UTC')
                        echo "Build-Date: $BUILD_DATE_FORMATTED" >> "$PACKAGES_FILE"
                        echo "Source-Date: $RELEASE_DATE" >> "$PACKAGES_FILE"
                        
                        # Add build identifier based on release date to ensure uniqueness
                        BUILD_ID=$(echo "$RELEASE_DATE" | md5sum | cut -c1-8 2>/dev/null || echo "$(date +%s)" | tail -c8)
                        echo "Build-ID: repo-$BUILD_ID" >> "$PACKAGES_FILE"
                    fi
                fi
                
                # Clean up temp directory
                rm -rf "$tmpdir"
                
                # Add file information with relative path from repository root
                echo "Filename: pool/main/e/electerm/$deb_basename" >> "$PACKAGES_FILE"
                echo "Size: $(stat -c%s "$deb_file" 2>/dev/null || stat -f%z "$deb_file")" >> "$PACKAGES_FILE"
                echo "MD5sum: $(md5sum "$deb_file" 2>/dev/null | cut -d' ' -f1 || md5 -q "$deb_file")" >> "$PACKAGES_FILE"
                echo "SHA1: $(sha1sum "$deb_file" 2>/dev/null | cut -d' ' -f1 || shasum -a 1 "$deb_file" | cut -d' ' -f1)" >> "$PACKAGES_FILE"
                echo "SHA256: $(sha256sum "$deb_file" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$deb_file" | cut -d' ' -f1)" >> "$PACKAGES_FILE"
                echo "" >> "$PACKAGES_FILE"
                
                # Set consistent file timestamps based on release date if available
                if [ -n "$RELEASE_DATE" ]; then
                    # Convert release date to timestamp format for touch command
                    RELEASE_TIMESTAMP=$(date -d "$RELEASE_DATE" '+%Y%m%d%H%M.%S' 2>/dev/null || echo "")
                    if [ -n "$RELEASE_TIMESTAMP" ]; then
                        touch -t "$RELEASE_TIMESTAMP" "$deb_file" 2>/dev/null || true
                        echo "Set file timestamp to release date: $RELEASE_DATE"
                    fi
                fi
            fi
        done
        
        # Validate the generated Packages file
        echo "Validating Packages file..."
        if [ -s "$PACKAGES_FILE" ]; then
            PACKAGE_COUNT=$(grep -c "^Package:" "$PACKAGES_FILE" || echo "0")
            echo "Generated Packages file contains $PACKAGE_COUNT package(s)"
            
            # Verify required fields are present
            if ! grep -q "^Version:" "$PACKAGES_FILE"; then
                echo "Error: No Version field found in Packages file"
                exit 1
            fi
            
            if ! grep -q "^Architecture:" "$PACKAGES_FILE"; then
                echo "Error: No Architecture field found in Packages file"
                exit 1
            fi
            
            echo "Packages file validation successful"
        else
            echo "Error: Packages file is empty"
            exit 1
        fi
        
        # Set consistent timestamps on repository files
        if [ -n "$RELEASE_DATE" ]; then
            RELEASE_TIMESTAMP=$(date -d "$RELEASE_DATE" '+%Y%m%d%H%M.%S' 2>/dev/null || echo "")
            if [ -n "$RELEASE_TIMESTAMP" ]; then
                touch -t "$RELEASE_TIMESTAMP" "$PACKAGES_FILE" 2>/dev/null || true
                echo "Set Packages file timestamp to release date: $RELEASE_DATE"
            fi
        fi
        
        # Compress Packages file
        gzip -k "$PACKAGES_FILE"
        
        # Set timestamp on compressed file too
        if [ -n "$RELEASE_DATE" ] && [ -n "$RELEASE_TIMESTAMP" ]; then
            touch -t "$RELEASE_TIMESTAMP" "$PACKAGES_FILE.gz" 2>/dev/null || true
        fi
        
        # Generate Release file in the proper location
        echo "Generating Release file..."
        RELEASE_DIR="$DEB_DIR/dists/stable"
        RELEASE_FILE="$RELEASE_DIR/Release"
        RELEASE_DATE_FORMATTED=""
        if [ -n "$RELEASE_DATE" ]; then
            # Try to format the release date, fallback to current date
            RELEASE_DATE_FORMATTED=$(date -u -d "$RELEASE_DATE" '+%a, %d %b %Y %H:%M:%S UTC' 2>/dev/null || date -u '+%a, %d %b %Y %H:%M:%S UTC')
        else
            RELEASE_DATE_FORMATTED=$(date -u '+%a, %d %b %Y %H:%M:%S UTC')
        fi
        
        cat > "$RELEASE_FILE" << EOF
Origin: Electerm
Label: Electerm Repository
Suite: stable
Codename: stable
Architectures: amd64
Components: main
Description: Official Electerm Debian Repository
Date: $RELEASE_DATE_FORMATTED
EOF
        
        # Add version information if available
        if [ -n "$RELEASE_TAG" ]; then
            echo "Version: $RELEASE_TAG" >> "$RELEASE_FILE"
        fi
        
        # Add checksums to Release file (relative to dists/stable directory)
        cd "$RELEASE_DIR"
        echo "MD5Sum:" >> "$RELEASE_FILE"
        for file in main/binary-amd64/Packages main/binary-amd64/Packages.gz; do
            if [ -f "$file" ]; then
                md5_hash=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1 || md5 -q "$file")
                size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
                printf " %s %8s %s\n" "$md5_hash" "$size" "$file" >> "$RELEASE_FILE"
            fi
        done
        
        echo "SHA1:" >> "$RELEASE_FILE"
        for file in main/binary-amd64/Packages main/binary-amd64/Packages.gz; do
            if [ -f "$file" ]; then
                sha1_hash=$(sha1sum "$file" 2>/dev/null | cut -d' ' -f1 || shasum -a 1 "$file" | cut -d' ' -f1)
                size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
                printf " %s %8s %s\n" "$sha1_hash" "$size" "$file" >> "$RELEASE_FILE"
            fi
        done
        
        echo "SHA256:" >> "$RELEASE_FILE"
        for file in main/binary-amd64/Packages main/binary-amd64/Packages.gz; do
            if [ -f "$file" ]; then
                sha256_hash=$(sha256sum "$file" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$file" | cut -d' ' -f1)
                size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
                printf " %s %8s %s\n" "$sha256_hash" "$size" "$file" >> "$RELEASE_FILE"
            fi
        done
        
        # Set consistent timestamp on Release file
        if [ -n "$RELEASE_DATE" ] && [ -n "$RELEASE_TIMESTAMP" ]; then
            touch -t "$RELEASE_TIMESTAMP" "$RELEASE_FILE" 2>/dev/null || true
            echo "Set Release file timestamp to release date: $RELEASE_DATE"
        fi
        
        echo "Repository files generated successfully!"
        
        # Delete the actual .deb file since we use URL rewrite rules in vercel.json
        echo "Deleting .deb file (using URL rewrite instead)..."
        if [ -f "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME" ]; then
            rm "$DEB_DIR/pool/main/e/electerm/$DEB_ASSET_NAME"
            echo "Deleted: $DEB_ASSET_NAME"
        fi
        
else
    echo "No .deb asset to download"
fi

# Display release information if provided
if [ -n "$RELEASE_TAG" ]; then
    echo "Release tag: $RELEASE_TAG"
fi

if [ -n "$RELEASE_DATE" ]; then
    echo "Release date: $RELEASE_DATE"
fi

if [ -n "$GPG_KEY_ID" ]; then
    echo "GPG Key ID provided: $GPG_KEY_ID"
    
    if [ -n "$GPG_PRIVATE_KEY" ]; then
        echo "GPG Private Key provided, signing repository..."
        
        # Import GPG private key
        echo "$GPG_PRIVATE_KEY" | base64 -d | gpg --batch --import
        
        # Sign the Release file in the proper location
        RELEASE_DIR="$DEB_DIR/dists/stable"
        cd "$RELEASE_DIR"
        if [ -f "Release" ]; then
            gpg --batch --yes --detach-sign --armor --local-user "$GPG_KEY_ID" --output Release.gpg Release
            gpg --batch --yes --clearsign --local-user "$GPG_KEY_ID" --output InRelease Release
            echo "Repository signed successfully!"
        else
            echo "Release file not found, skipping signing"
        fi
    else
        echo "GPG Private Key not provided, skipping signing"
    fi
else
    echo "GPG Key ID not provided, skipping signing"
fi

echo "Debian repository build completed successfully!"