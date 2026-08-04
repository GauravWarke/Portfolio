// Power Query (M) — connect Power BI to the portfolio data in Supabase.
//
// Project: hoxrzbwvsmwvpkitnwdp  (Sydney / ap-southeast-2)
//
// Connection settings:
//   Server    aws-0-ap-southeast-2.pooler.supabase.com:5432   (Session pooler)
//   Database  postgres
//   Username  postgres.hoxrzbwvsmwvpkitnwdp
//   Password  entered in Power BI's credential prompt -- never stored here
//
// Why the pooler, not db.hoxrzbwvsmwvpkitnwdp.supabase.co: that host has no DNS
// record. New Supabase projects do not publish a direct IPv4 database host, so
// the direct connection cannot resolve. The pooler host above was verified to
// resolve (13.237.241.81, 13.238.183.126, 3.106.102.114) and to accept TCP on
// port 5432.
//
// If the connection is refused, check Project Settings -> Database -> Connection
// string: some projects sit behind aws-1-... rather than aws-0-...
//
// Power BI Desktop -> Home -> Get data -> Blank query -> Advanced Editor.

// ---- Query: BusinessChurn -------------------------------------------------
let
    PoolerHost = "aws-0-ap-southeast-2.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="business_churn_by_state"]}[Data]
in
    Data

// ---- Query: AdSpend -------------------------------------------------------
let
    PoolerHost = "aws-0-ap-southeast-2.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="govt_ad_spend_by_channel"]}[Data]
in
    Data

// ---- Query: RetailDemand --------------------------------------------------
let
    PoolerHost = "aws-0-ap-southeast-2.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="retail_demand_series"]}[Data],
    WithDate = Table.AddColumn(Data, "date", each Date.FromText([period] & "-01"), type date)
in
    WithDate

// ---- Query: GstDistribution -----------------------------------------------
let
    PoolerHost = "aws-0-ap-southeast-2.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="gst_reconciliation_by_state"]}[Data]
in
    Data

// ---- Query: State (conformed dimension, from the view) --------------------
let
    PoolerHost = "aws-0-ap-southeast-2.pooler.supabase.com:5432",
    Source = PostgreSQL.Database(PoolerHost, "postgres"),
    Data   = Source{[Schema="public", Item="state_dim"]}[Data],
    Renamed = Table.RenameColumns(Data, {{"state", "State"}})
in
    Renamed
