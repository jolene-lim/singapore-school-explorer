# Final Project Propsal
## Background
**Title**: Educational Inequality in Singapore  
**Team Members**: Clinton Wong (cxw2002), Jolene Lim (jyl2187)

## Abstract
Given the governmental rhetoric that "every school is a good school", we are interested in investigating the education landscape in Singapore, specifically focusing on educational (in)equality. Some questions we are looking at include:
1. Indicators of "quality" - how due perceptions of a school's quality (e.g. on forums, as indicated through entry cut-off grades) compare to actual indicators (e.g. passing rates on national exams)
2. How do these correlate with spatial inequality - in Singapore, priority enrollment in primary schools (elementary schools) are given to those living within 1km radius. Do wealthy areas tend to correlate with where "quality" schools are located?
3. How do the flows of resources correlate with education quality (e.g. do higher quality schools tend to offer the same types of extracurriculars, are there resources exclusive to a certain cluster of schools).

## Data
Data would be obtained from several different sources:
1. Schools information would be obtained from data.gov.sg, an online database portal containing a variety of data sets. The data set of interest contains information about the schools in Singapore, on variables such as level of education, location, subjects and types of extracurricular activities offered.  
   - This would also be supplemented with information directly from the school's website if some information is found to be missing, such as minimum score for enrollment.  
2. More information about schools including admission cut-off scores (which can indicate ‘quality’), etc. can be found here: https://beta.moe.gov.sg/schoolfinder/. This information can be easily scraped to provide more data.  
3. Champions of school competitions would be obtained from redsports.sg, an online website which reports news related to sports competitions at various education levels.  
4. We could also scrape an online forum of Singapore parents, kiasuparents.com., which is a site where parents discuss schools. This site can be also scrapped to form richer data, e.g. sentiment analysis on each school.

## Visualisations
The final project would culminate in a single website (which might could be a shiny dashboard). Several deliverables are considered:  
1. Maps - Leaflet maps would be used to visualise the location of each school. 
This would likely use the Onemap basemap, a basemap developed by Singapore.
2. Networks - The relationships between schools would be visualised, with each school being represented by nodes, and their relationships, such as number of common subjects offered, or physical proximity, represented as edges.
    - This would likely be created using iGraph, networkX or D3.
3. Interactive graphs - Plots of various metrics, such as number of top scorers, between schools would be provided, and likely be interactive. This would allow a user to select the metrics of interest, and specific parameters (such as filtering by a geographic location).
    - This would likely be created using Shiny.
4. Word clouds - these could be integrated into our plots (e.g. in the popups) 