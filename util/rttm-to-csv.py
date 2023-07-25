import argparse, csv, os, sys
from decimal import Decimal

parser = argparse.ArgumentParser(
  prog = "csv-to-rttm",
  description = "Given a RTTM diarization file, outputs an equivalent CSV file.",
  formatter_class = argparse.ArgumentDefaultsHelpFormatter, # includes default values in help menu
) 

parser.add_argument("inputfile", help="Input file (.rttm)")
parser.add_argument("outputfile", help="Output file (.csv)")
args = parser.parse_args()

inputFile = getattr(args, "inputfile")
outputFile = getattr(args, "outputfile")

try:
  if "rttm" not in inputFile.lower():
    sys.exit("ERROR: Input file: " + inputFile + " is not a RTTM")
  if "csv" not in outputFile.lower():
    sys.exit("ERROR: Output file: " + outputFile + " is not a CSV")
  print("starting conversion of input file: " + inputFile + " to CSV...")
  with open(outputFile, mode="w") as out_file:
    with open(inputFile, "r") as rttm_input:
      reader = csv.reader(rttm_input, delimiter=" ")
      csv_writer = csv.writer(out_file, delimiter=",")
      for i, line in enumerate(reader):
        dur_lock = "false" if line[9] == "0" else "true"
        spkr_lock = "false" if line[10] == "0" else "true"
        bth_lock = "false" if line[11] == "0" else "true"
        csv_writer.writerow([line[7], line[3], str(Decimal(line[3])+Decimal(line[4])), dur_lock, spkr_lock, bth_lock])
  print("conversion finished with output file " + outputFile)
except Exception as e: 
  print(e)