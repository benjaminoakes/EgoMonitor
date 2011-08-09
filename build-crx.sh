#!/usr/bin/bash
build_dir="build/crx"

if [ -d `dirname $build_dir` ]; then
    rm -rf `dirname $build_dir`
fi

mkdir -p "$build_dir"

cp "crx/manifest.json" "$build_dir"
cp "crx/popup.html" "$build_dir"
cp "public/images/icon.png" "$build_dir"
ls "$build_dir"
