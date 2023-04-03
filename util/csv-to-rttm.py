import argparse, csv, os, sys
from decimal import Decimal

parser = argparse.ArgumentParser(
  prog = "csv-to-rttm",
  description = "Given a CSV diarization file, outputs an equivalent RTTM file.",
  formatter_class = argparse.ArgumentDefaultsHelpFormatter, # includes default values in help menu
) 

parser.add_argument("inputfile", type=argparse.FileType("r"), help="Input file (.csv)")
parser.add_argument("outputfile", type=argparse.FileType("w"), help="Output file (.rttm)")
args = parser.parse_args()

fileText, fileExtension = os.path.splitext(getattr(args, "inputfile"))
fileName = fileText + fileExtension
outputFile = getattr(args, "outputfile"):

try:
  if "csv" not in fileExtension.lower():
    sys.exit("ERROR: Input file: " + fileName + " is not a CSV")
  if "rttm" not in outputFile.lower():
    sys.exit("ERROR: Output file: " + outputFile + " is not a RTTM")
    
  print("starting conversion of input file '" + fileName + "' to RTTM...")
  with open(outputFile, mode="w") as rttm_writer:
    with open(fileName, "r") as csv_input:
      reader = csv.reader(csv_input, delimiter=",")
      for i, line in enumerate(reader):
        rttm_writer.write(" ".join(["SPEAKER", fileText, "1", line[1], str(Decimal(line[2])-Decimal(line[1])), "<NA>", "<NA>", line[0], "<NA>", "<NA>"]) + "\n")
  print("conversion finished with output file " + outputFile)
except Exception as e: 
  print(e)
