#!/usr/bin/ruby

#Run from Automator, after an Album Export action. Just a delta sync, so this doesn't remove anything from
#the main PhotoView db, and won't update metadata/captions for anything that's already there. 'Deltaexport' smart
#album in Photos.app grabs anything imported in the last 7 days.
require 'date'
require 'fileutils'
require 'shellwords'
require 'tmpdir'

def log(t)
  File.open("/tmp/delta_sync_main_photos.log", "a") do |f|
    f.puts "#{Time.now}: #{t}"
  end
end

log "Starting delta_sync_main_photos.rb - 0 is #{ARGV[0]}, 1 is #{ARGV[1]}, 2 is #{ARGV[2]}"
exit if ARGV[0].nil? or ARGV[0] == ""

SOURCE_PATH = ARGV[0] + (ARGV[0].end_with?("/") ? "" : "/") #Passed in by Automator.

DEST_PATH = ARGV[1] 
DEST_PORT = ARGV[2] 

#Resize images down
mogrify_command = %Q(/usr/local/bin/mogrify -geometry 2000x2000 -quality 80 #{Shellwords.escape(SOURCE_PATH)}*.jpeg)
log mogrify_command
system(mogrify_command)

#Create the album structure. The source files are in a flat directory, because Photos.app's Automator action doesn't
#allow 'export with folders' (unlike the UI-based export) - so we'll read the EXIF data for each photo to get its date,
#make the folders if needed, then move it there.
#We can't just use today's date because we might have recently imported an old photo.
entries = Dir.entries(SOURCE_PATH)
entries.each do |f|
  next if f.start_with?(".")
  if f.end_with?(".jpeg") or f.end_with?(".mov")
    begin
      cmd = %Q(/usr/local/bin/exiftool -s -d "%Y-%m-%d" -DateTimeOriginal #{Shellwords.escape(SOURCE_PATH + f)})
      log cmd
      exif = `#{cmd}`
      log "results: #{exif}"
      date_str = exif.split("\n")[0].split(":")[1].strip
      date = Date.parse(date_str)
    rescue
      log "#{f}: ERROR no exif data; falling back to today's date"
      date = Date.today
    end
    album_path = "#{SOURCE_PATH}#{date.strftime("%Y/%Y-%m")}"
    log "#{f}: moving to #{album_path}"
    FileUtils.mkdir_p album_path
    FileUtils.mv "#{SOURCE_PATH}#{f}", album_path
  end
end

# Rsync it - no delete this time
rsync_command = %Q(/usr/local/bin/rsync -rv --info=progress2 -e 'ssh -p #{DEST_PORT}' #{Shellwords.escape(SOURCE_PATH)} #{DEST_PATH})
log rsync_command
system(rsync_command)

#Photoview will now autoscan on plex

#Remove source
log "rm_rf #{SOURCE_PATH}"
FileUtils.rm_rf SOURCE_PATH if SOURCE_PATH.include?("/Users/gwyn/Pictures/Photos Export")

log "Done"
