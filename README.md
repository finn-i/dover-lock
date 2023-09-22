<!-- Project Title -->
# COMPX594 Thesis: User Edit Retention in Content Analysis Output Combination

<!-- Project Description -->
Core and utility scripts contributing to the retention of user edits when combining diarization outputs for error rate improvements. Additionally includes code which contributes to an enriched audio player and diarization editor. 

![Screenshot of Diarization Editor](https://i.imgur.com/xoeLleM.png)

<!-- Directories -->
## [dover-lock/](dover-lock)
Contains DOVER-Lock scripts. Builds upon the existing DOVER program, allowing for retention of user edits in diarisation input streams through the implementation of locked regions.

## [util/](util)
Contains various utility scripts and files developed at various stages of the thesis. Each file is described in more detail in the directory.

<!-- Files -->
## [core.css](core.css)
Primary CSS file containing styling rules for a digital library collection containing audio.

## [document.xsl](document.xsl)
Primary XSL file holding relevant DOM elements and HTML for the enriched audio player / diarization editor.

## [utility_scripts.js](utility_scripts)
Primary JavaScript file containing the bulk of the audio player / diarization editor logic. Allows for the actuation of DOVER-Lock script.