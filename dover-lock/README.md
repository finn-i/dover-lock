<!-- Files -->
## [dover](dover)
DOVER GAWK script adapted to support and retain user edits. Utilises all scripts listed below.

## [detect-lock-overlaps](detect-lock-overlaps)
GAWK script. Detects and logs regions meeting various conditions of overlap between regions from DOVER-Lock inputs. Duration and speaker lock conflicts are also logged.

## [diar-score-report](diar-score-report)
Prints a speaker diarisation evaluation report.

## [dover-sort-rttms](dover-sort-rttms)
Sorts RTTM files by their average Diarisation Error Rate (DER).

## [dover-speaker-voting](dover-speaker-voting)
Last step in DOVER-Lock process. Consensus voting of label-mapped inputs. Additionally restores original speaker names, lock state, and lock type.

## [md-eval.pl](md-eval.pl)
Calculates DER between inputs. Used for mapping speaker labels to a common namespace.

## [stat-dist](stat-dist)
Computes miscellaneous stats for a distribution.