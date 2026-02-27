import csv
import sys
import os

input_file = r"c:\Users\BASE\Desktop\Source Code\Web\Web\data\publications.csv"
temp_file = r"c:\Users\BASE\Desktop\Source Code\Web\Web\data\publications_temp.csv"

# Make sure to handle unicode
with open(input_file, mode='r', encoding='utf-8') as f_in, \
     open(temp_file, mode='w', encoding='utf-8', newline='') as f_out:
    
    reader = csv.reader(f_in)
    writer = csv.writer(f_out)
    
    try:
        headers = next(reader)
        if "thumbnail" not in headers:
            headers.append("thumbnail")
        writer.writerow(headers)
        
        for row in reader:
            if len(row) < len(headers):
                row.append("")
            writer.writerow(row)
    except Exception as e:
        print(f"Error processing CSV: {e}")
        sys.exit(1)

os.replace(temp_file, input_file)
print("Successfully added thumbnail column")
