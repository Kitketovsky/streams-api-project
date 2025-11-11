# Log File Analyzer with Real-time Processing

Build a CLI tool that processes large log files using streams to analyze web server logs.

## What you'll build:

A program that reads massive log files (like Apache/Nginx logs) and:

- Counts requests by HTTP status code
- Finds the most frequently accessed URLs
- Calculates total bandwidth used
- Identifies unique IP addresses
- All without loading the entire file into memory!

## Bonus challenges:

- Add a progress bar showing percentage processed
- Stream data from a URL instead of a file
- Compress output on-the-fly using zlib streams
- Handle multiple files concurrently
