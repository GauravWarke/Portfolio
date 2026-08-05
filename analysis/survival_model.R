# survival_model.R — how fast Australian businesses fail, and where
#
#   Rscript analysis/survival_model.R
#
# The ABS publishes survival as a set of point-in-time rates: the share of
# businesses trading in June 2021 that were still trading one, two, three and
# four years later. That is a discrete survival function, so it can be analysed
# properly rather than just charted.
#
# This script:
#   1. reconstructs the survival curve for each industry division,
#   2. derives the annual hazard rate — the conditional probability of failing
#      in a year given survival to its start, which is what actually differs
#      between industries,
#   3. fits an exponential survival model per industry to get a single
#      comparable decay constant and a median-lifetime estimate,
#   4. writes a tidy table plus two charts.
#
# The hazard rate matters more than the raw survival rate: a low four-year
# survival figure can come either from steady attrition or from heavy early
# failure, and those imply different interventions.
#
# Requires: readr, dplyr, tidyr, ggplot2, scales
#   install.packages(c("readr", "dplyr", "tidyr", "ggplot2", "scales"))

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(tidyr)
  library(ggplot2)
  library(scales)
})

args <- commandArgs(trailingOnly = FALSE)
file_arg <- sub("^--file=", "", args[grep("^--file=", args)])
here <- if (length(file_arg)) dirname(normalizePath(file_arg)) else getwd()
root <- normalizePath(file.path(here, ".."))
data_dir <- file.path(root, "data")
out_dir  <- file.path(root, "assets", "charts")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

ink <- "#141311"; cream <- "#EFEDE7"; accent <- "#B5502E"; steel <- "#456187"

theme_portfolio <- function() {
  theme_minimal(base_size = 13) +
    theme(
      plot.background  = element_rect(fill = cream, colour = NA),
      panel.background = element_rect(fill = cream, colour = NA),
      panel.grid.minor = element_blank(),
      panel.grid.major = element_line(colour = alpha(ink, 0.08)),
      plot.title    = element_text(face = "bold", size = 16, colour = ink),
      plot.subtitle = element_text(size = 11, colour = alpha(ink, 0.7)),
      plot.caption  = element_text(size = 8, colour = alpha(ink, 0.5), hjust = 0),
      axis.text     = element_text(colour = alpha(ink, 0.8)),
      axis.title    = element_text(colour = alpha(ink, 0.7))
    )
}

# --- survival curve per industry ---------------------------------------------
industry <- read_csv(file.path(data_dir, "business_survival_by_industry.csv"),
                     show_col_types = FALSE)

# S(t): survival to year t. Year 0 is the June 2021 cohort, so S(0) = 100%.
curves <- industry |>
  transmute(industry,
            `0` = 100,
            `3` = survival_3yr_pct,
            `4` = survival_4yr_pct) |>
  pivot_longer(-industry, names_to = "year", values_to = "survival") |>
  mutate(year = as.numeric(year))

# --- annual hazard between year 3 and year 4 ---------------------------------
# h = 1 - S(4)/S(3): of those alive at year 3, the share lost during year 4.
hazard <- industry |>
  mutate(
    hazard_yr4_pct = round((1 - survival_4yr_pct / survival_3yr_pct) * 100, 2),
    # Exponential fit S(t) = exp(-lambda * t) using the four-year point.
    lambda         = -log(survival_4yr_pct / 100) / 4,
    median_years   = round(log(2) / lambda, 1)
  ) |>
  arrange(desc(hazard_yr4_pct))

write_csv(
  hazard |> select(industry, survival_3yr_pct, survival_4yr_pct,
                   hazard_yr4_pct, median_years),
  file.path(data_dir, "business_hazard_by_industry.csv")
)
message("  -> wrote data/business_hazard_by_industry.csv")

cat("\nAnnual hazard in year 4, highest first\n")
print(as.data.frame(hazard |> select(industry, hazard_yr4_pct, median_years) |> head(6)),
      row.names = FALSE)

# --- chart 1: survival curves, extremes highlighted --------------------------
extremes <- c(
  hazard$industry[which.max(hazard$survival_4yr_pct)],
  hazard$industry[which.min(hazard$survival_4yr_pct)]
)
curves <- curves |>
  mutate(highlight = ifelse(industry %in% extremes, industry, "Other industries"))

p1 <- ggplot(curves, aes(year, survival, group = industry)) +
  geom_line(data = ~ subset(.x, highlight == "Other industries"),
            colour = alpha(ink, 0.18), linewidth = 0.6) +
  geom_line(data = ~ subset(.x, highlight != "Other industries"),
            aes(colour = highlight), linewidth = 1.3) +
  geom_point(data = ~ subset(.x, highlight != "Other industries"),
             aes(colour = highlight), size = 2.4) +
  scale_colour_manual(values = setNames(c(steel, accent), extremes), name = NULL) +
  scale_y_continuous(limits = c(0, 100), labels = function(x) paste0(x, "%")) +
  scale_x_continuous(breaks = c(0, 3, 4)) +
  labs(title = "Business survival curves by industry",
       subtitle = "Share of the June 2021 cohort still trading, each line one industry division",
       x = "Years since June 2021", y = "Surviving",
       caption = "Source: ABS Counts of Australian Businesses (8165.0), Table 2") +
  theme_portfolio() +
  theme(legend.position = "bottom")

ggsave(file.path(out_dir, "r_survival_curves.png"), p1,
       width = 8, height = 5, dpi = 150, bg = cream)
message("  -> wrote assets/charts/r_survival_curves.png")

# --- chart 2: hazard rate ranking --------------------------------------------
p2 <- ggplot(hazard |> mutate(industry = reorder(industry, hazard_yr4_pct)),
             aes(industry, hazard_yr4_pct, fill = hazard_yr4_pct)) +
  geom_col(width = 0.72) +
  geom_text(aes(label = paste0(sprintf("%.1f", hazard_yr4_pct), "%")),
            hjust = -0.15, size = 3, colour = ink) +
  coord_flip(clip = "off") +
  scale_y_continuous(expand = expansion(mult = c(0, 0.16))) +
  scale_fill_gradient(low = alpha(steel, 0.5), high = accent, guide = "none") +
  labs(title = "Annual failure risk in year four",
       subtitle = "Of businesses still trading at year three, the share lost during year four",
       x = NULL, y = "Hazard rate (%)",
       caption = "Derived from ABS 8165.0 Table 2: h = 1 - S(4)/S(3)") +
  theme_portfolio()

ggsave(file.path(out_dir, "r_hazard_by_industry.png"), p2,
       width = 8, height = 7.2, dpi = 150, bg = cream)
message("  -> wrote assets/charts/r_hazard_by_industry.png")

message("\nSurvival model complete.")
