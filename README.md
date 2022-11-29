# Scrapper - NSwitch TitleDB
A GitHub Action checks the [GB.en.json](https://raw.githubusercontent.com/blawar/titledb/master/GB.en.json) file from [blawar's titledb repo](https://github.com/blawar/titledb) every day, at 1 AM and 1 PM. If that file has been changed then the script makes a copy of it and saves it as "**titledb-source.json**". Then it writes the selected data to the slimmed-down file (**titledb.bin**), compressed using Brotli.  

## References
* https://simonwillison.net/2020/Oct/9/git-scraping/
* https://githubnext.com/projects/flat-data#why-flat-data
