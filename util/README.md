<!-- Files -->
## [csv-to-rttm.py](csv-to-rttm.py)
Given a CSV file from GS3 Pyannote script, generates the equivalent RTTM file.

## [detect-lock-overlaps](detect-lock-overlaps)
GAWK script. Detects and logs regions meeting various conditions of overlap between regions from DOVER-Lock inputs. Duration and speaker lock conflicts are also logged.

## [diarization.py](diarization.py)
Uses Pyannote, a diarization tool written for Python to generate a CSV file when given audio. Takes audio, authentication token, output file, and minimum gap between same-speaker regions as arguments.

## [dover](dover)
DOVER GAWK script adapted to support and retain user edits. Calls dover-speaker-voting.

## [dover-speaker-voting](dover-speaker-voting)
Last step in DOVER-Lock process. Consensus voting of label-mapped inputs. Additionally restores original speaker names, lock state, and lock type.

## [doveraction.pm](doveraction.pm)
Perl Module used to initiate DOVER-Lock from Greenstone interface using a POST AJAX request. 

## [mayavoz.py](mayavoz.py)
Given an audio file, removes background noise using given pretrained model URL. Uses Mayavoz library which provides a small selection of URLs. Noise reduction was explored as an avenue which could lead to a re-iteration of a diarization process, providing an incentive for user edit retention.  

## [rttm-to-csv.py](rttm-to-csv.py)
Given a RTTM file, generates the equivalent CSV file for use as a Greenstone document associated file.

