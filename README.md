# Recipe Keeper

A simple web app used to create, read, update, and delete recipe collections and recipes.
Created with PostgreSQL and Express.js

Tested on:
MacBook Air M1 Ventura 13.2 (22D49)

Note: This app has not been tested on other platforms or environments.

## Requirements

<ul>
  <li>Google Chrome Version 111.0.5563.146 (Official Build) (arm64)</li>
  <li>node v19.5.0</li>
  <li>postgres (PostgreSQL) 14.7</li>
</ul>

## Installation

1. Unzip zip file.
2. Run these commands from Terminal:

```
cd recipe-keeper
npm install
createdb recipe-collections
psql -d recipe-collections < schema.sql
psql -d recipe-collections < lib/seed-data.sql
npm run add-users
npm start
```

3. Use the app by heading to http://localhost:3000 with your browser.

## Usage

Anonymous users can only access the Signin page.
To access authenticated users' pages, use the credentials:

username: `admin` password: `secret`
OR
username: `developer` password: `letmein`

## Features

<ul>
  <li> Manage personal recipe collections, recipes, and ingredients with user authentication.</li>
  <li> View, add, edit, or delete a new recipe collection.</li>
  <li> Track recipe collection title and number of recipes.</li>
  <li> View, add, edit, or delete recipes in collections.</li>
  <li> Track recipe title, prep time, total time, instructions, and ingredients.</li>
  <li> View, add, or delete ingredients in recipes.</li>
  <li> Track ingredient name, quantity, and units.</li>
</ul>
