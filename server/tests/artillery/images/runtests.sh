#!/bin/bash

# OUTPUT can be "pretty" or "json"
OUTPUT="json"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

runDbScript() {
  DB=$(sh "$DIR/$1")
  DATA="$DB" TYPE="DB" NAME="$2" node "$DIR/../report.js"
}

runTest() {
  OVERRIDES="{\"config\": {\"plugins\": {\"expect\": {\"outputFormat\": \"$OUTPUT\"}}}}" 
  VAL=$(artillery run -q --overrides "$OVERRIDES" "$DIR/$1")
  DATA="$VAL" TYPE="TEST" NAME="$2" node "$DIR/../report.js"
}

#runDbScript "sh-file-path.sh" "Script Name"

runTest "images.yml" "Images"