import argparse, csv, os, sys
from decimal import Decimal

parser = argparse.ArgumentParser(
  prog = "csv-to-rttm",
  description = "Given a CSV diarization file, outputs an equivalent RTTM file.",
  formatter_class = argparse.ArgumentDefaultsHelpFormatter, # includes default values in help menu
) 

parser.add_argument("inputfile", help="Input file (.csv)")
parser.add_argument("outputfile", help="Output file (.rttm)")
parser.add_argument("-id", "--recordingid", help="ID of diarization data (e.g. audio name), gets stored in RTTM")
args = parser.parse_args()

inputFile = getattr(args, "inputfile")
outputFile = getattr(args, "outputfile")
recordingID = getattr(args, "recordingid")

try:
  if "csv" not in inputFile.lower():
    sys.exit("ERROR: Input file: " + inputFile + " is not a CSV")
  if "rttm" not in outputFile.lower():
    sys.exit("ERROR: Output file: " + outputFile + " is not a RTTM")
  if recordingID is None:  
    recordingID = inputFile
  print("starting conversion of input file: " + inputFile + " to RTTM...")
  with open(outputFile, mode="w") as rttm_writer:
    with open(inputFile, "r") as csv_input:
      reader = csv.reader(csv_input, delimiter=",")
      for i, line in enumerate(reader):
        rttm_writer.write(" ".join(["SPEAKER", recordingID, "1", line[1], str(Decimal(line[2])-Decimal(line[1])), "<NA>", "<NA>", line[0], "<NA>", "<NA>"]) + "\n")
  print("conversion finished with output file " + outputFile)
except Exception as e: 
  print(e)