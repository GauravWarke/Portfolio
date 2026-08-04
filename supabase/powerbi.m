// Power Query (M) — connect Power BI to the portfolio data in Supabase.
//
// Replace hoxrzbwvsmwvpkitnwdp with your Supabase project ref
// (Project Settings -> Database -> Host).
// Credentials are entered in Power BI's own prompt; never store them here.
//
// Power BI Desktop -> Home -> Get data -> Blank query -> Advanced Editor.

// ---- Query: BusinessChurn -------------------------------------------------
let
    // e.g. "aws-0-ap-southeast-2.pooler.supabase.com:5432"
    PoolerHost = "aws-0-<region>.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="business_churn_by_state"]}[Data]
in
    Data

// ---- Query: AdSpend -------------------------------------------------------
let
    // e.g. "aws-0-ap-southeast-2.pooler.supabase.com:5432"
    PoolerHost = "aws-0-<region>.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="govt_ad_spend_by_channel"]}[Data]
in
    Data

// ---- Query: RetailDemand --------------------------------------------------
let
    // e.g. "aws-0-ap-southeast-2.pooler.supabase.com:5432"
    PoolerHost = "aws-0-<region>.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="retail_demand_series"]}[Data],
    WithDate = Table.AddColumn(Data, "date", each Date.FromText([period] & "-01"), type date)
in
    WithDate

// ---- Query: GstDistribution -----------------------------------------------
let
    // e.g. "aws-0-ap-southeast-2.pooler.supabase.com:5432"
    PoolerHost = "aws-0-<region>.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="gst_reconciliation_by_state"]}[Data]
in
    Data

// ---- Query: State (conformed dimension, from the view) --------------------
let
    // e.g. "aws-0-ap-southeast-2.pooler.supabase.com:5432"
    PoolerHost = "aws-0-<region>.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="state_dim"]}[Data],
    Renamed = Table.RenameColumns(Data, {{"state", "State"}})
in
    Renamed
