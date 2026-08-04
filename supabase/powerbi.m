// Power Query (M) — connect Power BI to the portfolio data in Supabase.
//
// Replace <project-ref> with your Supabase project ref
// (Project Settings -> Database -> Host).
// Credentials are entered in Power BI's own prompt; never store them here.
//
// Power BI Desktop -> Home -> Get data -> Blank query -> Advanced Editor.

// ---- Query: BusinessChurn -------------------------------------------------
let
    Source = PostgreSQL.Database("db.<project-ref>.supabase.co:5432", "postgres"),
    Data   = Source{[Schema="portfolio", Item="business_churn_by_state"]}[Data]
in
    Data

// ---- Query: AdSpend -------------------------------------------------------
let
    Source = PostgreSQL.Database("db.<project-ref>.supabase.co:5432", "postgres"),
    Data   = Source{[Schema="portfolio", Item="govt_ad_spend_by_channel"]}[Data]
in
    Data

// ---- Query: RetailDemand --------------------------------------------------
let
    Source = PostgreSQL.Database("db.<project-ref>.supabase.co:5432", "postgres"),
    Data   = Source{[Schema="portfolio", Item="retail_demand_series"]}[Data],
    WithDate = Table.AddColumn(Data, "date", each Date.FromText([period] & "-01"), type date)
in
    WithDate

// ---- Query: GstDistribution -----------------------------------------------
let
    Source = PostgreSQL.Database("db.<project-ref>.supabase.co:5432", "postgres"),
    Data   = Source{[Schema="portfolio", Item="gst_reconciliation_by_state"]}[Data]
in
    Data

// ---- Query: State (conformed dimension, from the view) --------------------
let
    Source = PostgreSQL.Database("db.<project-ref>.supabase.co:5432", "postgres"),
    Data   = Source{[Schema="portfolio", Item="state_dim"]}[Data],
    Renamed = Table.RenameColumns(Data, {{"state", "State"}})
in
    Renamed
