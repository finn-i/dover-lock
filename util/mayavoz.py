from mayavoz.models import Mayamodel
import argparse, os

parser = argparse.ArgumentParser(
  prog = "mayavoz",
  description = "Given an audio file, removes background noise. Outputs file as 'cleaned_[fileName]'",
  formatter_class = argparse.ArgumentDefaultsHelpFormatter, # includes default values in help menu
) 
parser.add_argument("inputfile", help="Audio input file (.wav)")
parser.add_argument("outputdir", help="Audio output directory", default=".")
parser.add_argument("-p", "--pretrainedURL", help="URL of pretrained model", default="shahules786/mayavoz-demucs-ms-snsd-20")
args = parser.parse_args()

fileText, fileExtension = os.path.splitext(getattr(args, "inputfile"))
fileName = fileText + fileExtension
cleanedFileName = "cleaned_" + fileName
outputDir = getattr(args, "outputdir")
pretrained_url = getattr(args, "pretrainedURL")

try:
  if os.path.isdir(outputDir):
    model = Mayamodel.from_pretrained(pretrained_url)
    if os.path.isfile(cleanedFileName):
      print("removing existing " + cleanedFileName)
      os.remove(cleanedFileName)
    print("starting mayavoz speech enhancement using pretrained recipe URL: " + pretrained_url + "...")
    model.enhance(fileName, save_output=True)
    print("converting output file to 44.1kHz to allow for playback in Safari...")
    conversionCMD = "ffmpeg -i " + cleanedFileName + " -y -ar 44100 -b:a 128k fixed-" + cleanedFileName
    print("running conversionCMD: " + conversionCMD)
    conversionResult = os.system(conversionCMD)
    if (conversionResult == 0): # success
      os.rename("fixed-" + cleanedFileName, outputDir + "/" + cleanedFileName) # move to output dir
      print("mayavoz noise reduction finished with output file: " + outputDir + "/" + cleanedFileName)      
    else:
      print("ERROR: conversionCMD failed")
  else:
    print("ERROR: output directory: " + outputDir + " does not exist")
except Exception as e: 
  print(e)
