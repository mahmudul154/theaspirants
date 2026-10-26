#!/bin/sh
# Fetch the three typefaces used by the dossier (all SIL Open Font License).
# Needed only to rebuild the PDF; the committed PDF has the fonts embedded.
set -e
D="$(dirname "$0")/_fonts"; mkdir -p "$D"
get() { curl -fsSL -H "Accept: application/vnd.github.raw" \
  "https://api.github.com/repos/google/fonts/contents/$1" -o "$D/$(basename "$1" | sed 's/%5B/[/;s/%5D/]/')"; }
get ofl/hindsiliguri/HindSiliguri-Light.ttf
get ofl/hindsiliguri/HindSiliguri-Regular.ttf
get ofl/hindsiliguri/HindSiliguri-SemiBold.ttf
get ofl/hindsiliguri/HindSiliguri-Bold.ttf
get "ofl/inter/Inter%5Bopsz,wght%5D.ttf"
get "ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
echo "fonts in $D"
