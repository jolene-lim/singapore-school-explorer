library(jsonlite)
library(dplyr)
library(purrr)


data = fromJSON("data/data/vacancies.json")

vacancies = data %>% map(function(x) {
  
  output = data.frame(Phase = c("Phase 1A", 
                                "Phase 2A1",
                                "Phase 2A2", 
                                "Phase 2B", 
                                "Phase 2C",
                                "Reserved 2B 2C", 
                                "Phase 2C (Sup)"))
  
  vacancies = c(0,0,0,0,
                0,0,0)
  
  vacancies[1] = try(x$`VACANCY FOR PHASE 1`)
  vacancies[2] = try(x$`VACANCY FOR PHASE 2A1`)
  vacancies[3] = try(x$`VACANCY FOR PHASE 2A2`)
  vacancies[4] = try(x$`VACANCY FOR PHASE 2B`)
  vacancies[5] = try(x$`VACANCY FOR PHASE 2C`)
  vacancies[6] = try(x$`VACANCIES RESERVED FOR PHASE 2B AND 2C`)
  vacancies[7] = ifelse(!is.null(x$`VACANCY FOR PHASE 2C SUPPLEMENTARY`),
                        x$`VACANCY FOR PHASE 2C SUPPLEMENTARY`,
                        0)
  
  applicants = c(0,0,0,0,
                 0,0,0)
  
  applicants[1] = x$`NO. OF APPLICANTS IN PHASE 1`
  applicants[2] = x$`NO. OF APPLICANTS IN PHASE 2A1`
  applicants[3] = x$`NO. OF APPLICANTS IN PHASE 2A2`
  applicants[4] = x$`NO. OF APPLICANTS IN PHASE 2B`
  applicants[5] = x$`NO. OF APPLICANTS IN PHASE 2C`
  applicants[6] = 0
  applicants[7] = ifelse(!is.null(x$`NO. OF APPLICANTS IN PHASE 2C SUPPLEMENTARY`),
                         x$`NO. OF APPLICANTS IN PHASE 2C SUPPLEMENTARY`,
                         0)
  
  output = cbind(output, Vacancies = vacancies, Applicants = applicants)
                      
  return(output)
  
  
}) %>% 
  bind_rows() %>% 
  cbind(School = rep(names(data), each = 7))
