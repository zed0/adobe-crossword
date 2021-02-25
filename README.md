# Adobe Crossword

This is the source code for the [Adobe Crossword](https://zed0.co.uk/crossword/) which was published shortly after the Adobe password leak of 2013.

## Hosting the crossword

Just serve the `client` directory somewhere and you should be able to play the crosswords in a browser.

## Generating a crossword

The `generator/generate.py` script can be used to generate JSON files suitable for use in the frontend.
To generate a file for the 100th to 200th most common passwords run the following:

```bash
cd generator
python2 generate.py 100 output.json
```

## Guessing more answers

The `generator/answers.sh` script can be used to guess answers one at a time and output them into a file suitable for usage with the crossword generator above.
An example usage to guess 100 clues starting with the 500th most common might look like:

```bash
cd generator
./answers.sh -o output.dat -n 100 -s 500
```

The password hints for the top 1000 clues are included in the `generator/clues` directory.

## TODO

- General tidy up/refactor
- Dynamically generated crosswords on the site
- Scripts for converting the original password dump (I've lost the files since I originally did it)
- More answers (currently 649 of 1000 passwords are answered)
    - An option to only answer unanswered passwords would be helpful for this

## Licence

Most of the code is released under the MIT licence in the LICENSE.txt file with the exception of:

- `generator/generate.py` which is available under a 3-clause BSD licence as detailed in the file.
- `client/jquery.crossword.js` which was originally released on [David Sherman's site](http://web.archive.org/web/20130829025921/http://www.david-sherman.com/projects/crosswordplugin) and is [now available on Github](https://github.com/david-sherman/jquery-crossword-plugin) under a GPLv3 licence.
