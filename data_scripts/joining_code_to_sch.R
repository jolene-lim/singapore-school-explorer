library(tidyverse)
library(rjson)

general_info = read_csv("data/general-information-of-schools-geocoded.csv")
schoolist = fromJSON(file = "data/data/schoolList.json")

schoolist = schoolist %>%
  reduce(bind_rows)

locations = fromJSON(file = "data/data/locations.json")

locations_df = locations %>%
  map(function(x) list(lat=x$coordinates[1], lon=x$coordinates[2])) %>%
  reduce(bind_rows)
locations_df$code = names(locations)

schoolist = schoolist %>%
  full_join(locations_df, by = ("code" = "code")) %>%
  filter(!is.na(lat))

joined = general_info %>%
  full_join(select(schoolist, code, name, lat, lon), by = c("school_name" = "name")) %>%
  mutate(lat.x = ifelse(is.na(lat.x), lat.y, lat.x),
         lon.x = ifelse(is.na(lon.x), lon.y, lon.x)) %>%
  select(-c(lat.y, lon.y)) %>%
  select(everything(), lat = lat.x, lon = lon.x) %>%
  filter(!is.na(code)) %>%
  mutate(mainlevel_code = ifelse(!is.na(mainlevel_code), mainlevel_code,
                                  ifelse(str_detect(school_name, "PRIMARY"), "PRIMARY",
                                     ifelse(str_detect(school_name, "SECONDARY"), "SECONDARY", "JUNIOR COLLEGE")
                                     )
                                 )
        )


write_excel_csv(joined, "data/general-information-full.csv")
