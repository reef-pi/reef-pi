# :globe_with_meridians: Internationalization Contribution Guide

__reef-pi__ is now multilingual and we need your help to make the translations fit all the languages we purpose to choose.

## How it works?

All the translations are stored in the `CSV` files in `assets/translations`. Each line describe a key/value pair. Those files are parsed and integrated into the Front-End application during the build process. The source language for all keys is the English, stored in `assets/translations/en.csv`.

The key maybe be simple or may describe a nested element with the use of namespaces. For example:
```bash
# this describe Loading translation as a global translation
loading,Loading
# output is : TranslationObject.loading
```

```bash
# This describe the Reload translation in the Configuration section in the admin panel
configuration:admin:reload,Reload
# output is : TranslationObject.configuration.admin.reload
```

Using namespaces give us more readability of where the translation is, mainly for people not familiar with front-end development or javascript.

If you want to dig into the code:

Csv to json parsing: [build/translations/csv-json.js](build/translations/csv-json.js) (called with `loader.js`)

Csv synchronization: [build/translations/csv-sync.js](build/translations/csv-sync.js) (called with `translations:sync`)

The CSV synchronization make sure the translations files are synchronized beetween each others.

Front-end integration: [jsx/utils/i18n.js](jsx/utils/i18n.js)

## :suspect: How do i contribute?

Just fork the project, make a branch for the completion of your translation and create a pull request.

If you're not familiar with all those aspects GitHub offers a web based csv editor. Here how you proceed from the reef-pi repository.

- go on [https://github.com/reef-pi/reef-pi](https://github.com/reef-pi/reef-pi)
- Click on fork (you'll be redirected to your fork on your account)
- Go on the CSV file you want to edit and click `Edit the file` with a pencil icon
- Make your changes
- Once you're done go to the bottom of the page and add a revelant commit message.
- Click on `create a new branch for this commit and start a pull request`
- go on [https://github.com/reef-pi/reef-pi](https://github.com/reef-pi/reef-pi)
- You'll see `compare & pull request` button appear at the top of the page, Click on it.
- Accept the pull request
- Wait for the review.

:raised_hands: TADA :raised_hands:

__Note__: If you want to add a sentence with a comma ',' you'll have to use quotes " around the string to escape the sentence with the comma; otherwise the CSV format will not be respected.

## :gift: I can provide a new language translation, how do i proceed?

First you have to create a file in the `assets/translations` folder with the [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (2 letters one) of the language you want to provide. For example `zh.csv` for chinese. And insert the headers in it:
```
Key,Translation
```

Once it's done you can use the command:

```
npm run translations:sync
```

And fill the document :smiley:
