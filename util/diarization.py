#!/usr/bin/env python3
from pyannote.audio import Pipeline
from pathlib import Path
import os, sys, time, csv, argparse

# remove available graphic cards to trigger cpu default
os.environ["CUDA_VISIBLE_DEVICES"] = "" 

from huggingface_hub import HfApi
available_pipelines = [p.modelId for p in HfApi().list_models(filter="pyannote-audio-pipeline")]
print(available_pipelines)

parser = argparse.ArgumentParser()
parser.add_argument('inputfile', help="Audio input file")
parser.add_argument('authtoken', help="Auth/access token") # https://github.com/pyannote/pyannote-audio
parser.add_argument('outputfile', nargs="?", help="Output file (.csv, optional)")
parser.add_argument("--mingap", type=int, help="Minimum gap size in seconds between same-speaker segments", default=1)
args = parser.parse_args()

fileName = getattr(args, "inputfile")
authToken = getattr(args, "authtoken")
outputFile = getattr(args, "outputfile")
gap_threshold = int(getattr(args, "mingap")); 

# replace file extension with .csv
p = Path(fileName)
if (outputFile == None):
    outputFile = "temp_" + str(p.with_suffix(".csv"))

if (os.path.exists(fileName)):
    print("starting pyannote pipeline with file: " + fileName)
    timeStart = time.perf_counter() # timer for performance monitoring
    FILEIN = {'audio': fileName}
    fileName, fileExtension = os.path.splitext(fileName)
    diarization = pipeline(FILEIN)
    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization@2.1", use_auth_token=authToken)
    try:
        with open(outputFile, mode="w") as out_file:
            csv_writer = csv.writer(out_file, delimiter=',')
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                csv_writer.writerow([speaker, round(turn.start, 1), round(turn.end, 1)])
    except Exception as e:
        print(e)

    print("pipeline completed.")
    print(f"processTime: {time.perf_counter()-timeStart:.1f}s")

    print("starting gap-removal with file: " + outputFile)
    print("minimum gap: " + str(gap_threshold) + "s")   
    try:
        with open(outputFile) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            names, starts, ends = [], [], []
            for row in csv_reader: # convert csv to arrays
                names.append(row[0])
                starts.append(float(row[1]))
                ends.append(float(row[2]))
        os.remove(outputFile)
    except Exception as e:
        print(e)

    try:
        with open(outputFile.replace("temp_", ""), mode="w") as out_file:
            num_items = len(names)
            csv_writer = csv.writer(out_file, delimiter=',')
            for i in range(1, num_items): # skip first line
                if names[i] == names[i-1] and starts[i]-ends[i-1] < gap_threshold: # if prev and curr rows should be joined
                    starts[i] = starts[i-1] # move prev start time to current
                else:
                    csv_writer.writerow([names[i-1], starts[i-1], ends[i-1]]) # write previous line to csv
            csv_writer.writerow([names[num_items-1], starts[num_items-1], ends[num_items-1]]) # write last line
    except Exception as e:
        print(e) 

    print("gap-removal completed.")

else:
    print("error: file " + fileName + "cannot be found")
