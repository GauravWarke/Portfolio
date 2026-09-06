# Documentation

Requirements, test and risk documentation for the four dashboards in this
repository. Written to the shape a business analyst would be asked for on a
real project, and kept honest about what the pipeline does and does not do.

| Document | What it covers |
| :--- | :--- |
| [Business requirements (BRD)](business-requirements.md) | Why each dashboard exists, who it is for, what counts as success |
| [Functional requirements (FRD)](functional-requirements.md) | What each parser and dashboard must do, source by source |
| [User stories](user-stories.md) | The same requirements from the user's side, with acceptance criteria |
| [UAT plan](uat-plan.md) | How to verify a build before it ships, including the checks CI already runs |
| [Risk register](risk-register.md) | What can break, how likely, and what catches it |
| [Data pipeline](data-pipeline.md) | Process model, data dictionary, and the reconciliation rules |

## The rule these documents exist to enforce

Every figure on every dashboard is read out of the publisher's own file. No
number is typed into this repository by hand. Each parser checks its output
against the total the publisher states and stops the run if the two disagree.

That rule is what the requirements are written around, what the tests assert,
and what the risk register is mostly about.

## Scope

Four datasets, all Australian government open data:

| Dashboard | Publisher | Source format |
| :--- | :--- | :--- |
| Business churn and survival | Australian Bureau of Statistics | Excel datacube (`8165DC01.xlsx`) |
| Government advertising spend | Department of Finance | Word report (`.docx`) |
| Retail demand | Australian Bureau of Statistics | Excel time-series workbook |
| GST reconciliation | Commonwealth Grants Commission | Word report (`.docx`, ~17 MB) |

## Status

These documents describe the pipeline as built, not a proposal. Where a
requirement is only partly met, the document says so rather than claiming a
pass it has not earned. The clearest example is the weekly reproducibility job,
which re-derives two of the four sources on GitHub's runners because two
government hosts do not answer datacentre ranges at all. That limitation is
recorded in the risk register and in the UAT plan, not hidden.
