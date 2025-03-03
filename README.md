# 12 weeks tracker

## Technical setup
For developers only. If you're not a developer, skip this.
The project is built using Tauri, Sveltekit and Vite.

## Usage
The app is built when I couldn't find an app to track the 12 week year workflow. Most of the information that can be found is using PDF sheets or Notion templates. This app offers a simple solution and graphical, intuitive interface to track your progress.

## Manual

### Add a vision (optional)
The idea is to start with a big vision, like, where do you want to be in 3 - 5 years time? You can enter this in the vision section.

### Add a goal
In order to obtain that goal, create a goal for the next 12 weeks. Every goal spans 12 weeks.
Once you have set a goal, you can plan it per week. After the first week, you don't have to manually retype every goal. You can just import and
and copy the previous week's tasks.

### Dashboard
The main page shows today's tasks that need to be done. You can only check a task once per day. 
If for some reason you didn't boot your computer for one or more days, you can still check the task as done through the progress screen.

### Track progress
For each goal, you can track weekly progress. By hovering or clicking on the week - where the current week is coloured yellow - you can see 
the details of the tasks below. By clicking on the pencil you get access to a screen that allows you to check tasks as done per day, for the whole week.

### Settings
By default, the app will store in the app data directory. It shows the directory where it is storing the data.
The app stores 2 files: config.json and 12weeksdata.json.
The first contains whether you want to save to a specific folder or not, and if you do, the actual directory.
The second file - 12weeksdata.json - stores one big json structure that contains all of your data.

Another possibility in the settings page is to import data. Be careful when using this, as this will overwrite the main 12weeksdata.json file.

### Data and security
The app is built to be used completely offline. No accounts, no subscriptions, no cloud sync.
Your data doesn't leave your computer. However, if you are looking for a way to sync between devices, an easy way is to set up 
your directory in settings to a "shared" directory (for example Mega, Dropbox, Google drive,...). I would suggest encrypting the file before sharing, for example using Cryptomator or something similar.

## Contact

Feedback is much appreciated. Buying me a coffee even more :).
Get in touch : vancleemputsven@protonmail.com