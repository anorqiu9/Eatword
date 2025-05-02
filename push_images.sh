#!/bin/bash

# Script to push image files to the remote repository in batches of 8

# Make sure we're in the right directory
cd "$(git rev-parse --show-toplevel)" || exit 1

# Get all PNG files in the images directory
image_files=($(find images -name "*.png" | sort))

# Total number of files
total_files=${#image_files[@]}
echo "Found $total_files image files to process"

# Process files in batches of 8
batch_size=45
batch_count=$(( (total_files + batch_size - 1) / batch_size ))

for ((batch=0; batch<batch_count; batch++)); do
    start_idx=$((batch * batch_size))
    end_idx=$(( (batch + 1) * batch_size - 1 ))
    
    # Make sure we don't go beyond the array bounds
    if [ $end_idx -ge $total_files ]; then
        end_idx=$((total_files - 1))
    fi
    
    echo "Processing batch $((batch + 1))/$batch_count (files $((start_idx + 1))-$((end_idx + 1)))"
    
    # Add files in this batch
    for ((i=start_idx; i<=end_idx; i++)); do
        echo "Adding ${image_files[$i]}"
        git add "${image_files[$i]}"
    done
    
    # Commit this batch
    batch_number=$((batch + 1))
    git commit -m "Add image batch $batch_number/$batch_count (files $((start_idx + 1))-$((end_idx + 1)))"
    
    # Push to remote
    echo "Pushing batch $batch_number to remote..."
    git push origin main
    
    echo "Batch $batch_number completed"
    echo "------------------------"
done

echo "All image files have been processed and pushed to the remote repository"
