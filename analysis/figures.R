# figures.R — visualise the four portfolio findings in R (ggplot2)
#
#   Rscript analysis/figures.R
#
# Reads the tidy artefacts in data/ (written by scripts/run_all.py) and writes
# four PNG charts into analysis/figures/. Nothing here is synthetic: every value
# comes from the committed CSVs, which mirror the published Australian open data.
#
# Requires: readr, dplyr, ggplot2, scales
#   install.packages(c("readr", "dplyr", "ggplot2", "scales"))

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(ggplot2)
  library(scales)
})

# --- resolve paths relative to the repo root (works from any cwd) ------------
args <- commandArgs(trailingOnly = FALSE)
file_arg <- sub("^--file=", "", args[grep("^--file=", args)])
here <- if (length(file_arg)) dirname(normalizePath(file_arg)) else getwd()
root <- normalizePath(file.path(here, ".."))
data_dir <- file.path(root, "data")
out_dir  <- file.path(here, "figures")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

# --- shared editorial theme (matches the portfolio: cream + ink) -------------
ink   <- "#141311"
cream <- "#EFEDE7"
accent <- "#B5502E"

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

save_chart <- function(plot, name, w = 8, h = 5) {
  path <- file.path(out_dir, name)
  ggsave(path, plot, width = w, height = h, dpi = 150, bg = cream)
  message("  -> wrote ", path)
}

# --- 1. Business base by state (ABS 8165.0) ----------------------------------
churn <- read_csv(file.path(data_dir, "business_churn_by_state.csv"),
                  show_col_types = FALSE) |>
  mutate(state = reorder(state, businesses))

p1 <- ggplot(churn, aes(state, businesses, fill = share_pct)) +
  geom_col(width = 0.72) +
  geom_text(aes(label = paste0(comma(businesses), "  (", share_pct, "%)")),
            hjust = -0.05, size = 3.2, colour = ink) +
  coord_flip(clip = "off") +
  scale_y_continuous(labels = comma, expand = expansion(mult = c(0, 0.22))) +
  scale_fill_gradient(low = alpha(accent, 0.45), high = accent, guide = "none") +
  labs(title = "Australia's business base is concentrated in the east",
       subtitle = "Actively trading businesses by state · 2.73M national total",
       x = NULL, y = "Businesses",
       caption = "Source: ABS Counts of Australian Businesses (8165.0)") +
  theme_portfolio()
save_chart(p1, "01_business_base_by_state.png")

# --- 2. Government ad spend by channel (Dept of Finance) ----------------------
ads <- read_csv(file.path(data_dir, "govt_ad_spend_by_channel.csv"),
                show_col_types = FALSE) |>
  mutate(channel = reorder(channel, spend_m))

p2 <- ggplot(ads, aes(channel, spend_m, fill = channel == "Digital")) +
  geom_col(width = 0.72) +
  geom_text(aes(label = paste0("$", spend_m, "M  (", share_pct, "%)")),
            hjust = -0.05, size = 3.2, colour = ink) +
  coord_flip(clip = "off") +
  scale_y_continuous(expand = expansion(mult = c(0, 0.25))) +
  scale_fill_manual(values = c(`TRUE` = accent, `FALSE` = alpha(ink, 0.55)),
                    guide = "none") +
  labs(title = "Digital now takes the largest share of government ad spend",
       subtitle = "Media placement by channel · 2023-24",
       x = NULL, y = "Spend ($M)",
       caption = "Source: Australian Department of Finance") +
  theme_portfolio()
save_chart(p2, "02_ad_spend_by_channel.png")

# --- 3. Retail turnover trend (ABS 8501.0) -----------------------------------
retail <- read_csv(file.path(data_dir, "retail_demand_series.csv"),
                   show_col_types = FALSE) |>
  mutate(date = as.Date(paste0(period, "-01")))

p3 <- ggplot(retail, aes(date, turnover_m)) +
  geom_line(colour = accent, linewidth = 1.1) +
  geom_point(colour = accent, size = 2.4) +
  geom_text(aes(label = comma(turnover_m)), vjust = -1.1, size = 3, colour = ink) +
  scale_x_date(date_labels = "%b %Y") +
  scale_y_continuous(labels = comma, expand = expansion(mult = c(0.08, 0.15))) +
  labs(title = "Retail turnover keeps climbing",
       subtitle = "Seasonally adjusted monthly turnover · +4.9% year on year to Jun 2025",
       x = NULL, y = "Turnover ($M)",
       caption = "Source: ABS Retail Trade (8501.0)") +
  theme_portfolio()
save_chart(p3, "03_retail_turnover_trend.png")

# --- 4. GST distribution by state (Commonwealth Grants Commission) ------------
gst <- read_csv(file.path(data_dir, "gst_reconciliation_by_state.csv"),
                show_col_types = FALSE) |>
  mutate(state = reorder(state, gst_bn))

p4 <- ggplot(gst, aes(state, gst_bn, fill = share_pct)) +
  geom_col(width = 0.72) +
  geom_text(aes(label = paste0("$", gst_bn, "bn  (", share_pct, "%)")),
            hjust = -0.05, size = 3.2, colour = ink) +
  coord_flip(clip = "off") +
  scale_y_continuous(expand = expansion(mult = c(0, 0.22))) +
  scale_fill_gradient(low = alpha(accent, 0.45), high = accent, guide = "none") +
  labs(title = "How the ~$102bn GST pool reconciles out to the states",
       subtitle = "GST distribution by state/territory · 2026-27 update",
       x = NULL, y = "GST distributed ($bn)",
       caption = "Source: Commonwealth Grants Commission") +
  theme_portfolio()
save_chart(p4, "04_gst_distribution_by_state.png")

message("\nAll four figures written to analysis/figures/.")
