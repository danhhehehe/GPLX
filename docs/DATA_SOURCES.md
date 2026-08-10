# Data Sources and Provenance

GPLX contains application code that can import and normalize driving-license learning data from external sources. The source code license does **not** automatically relicense third-party data, images, trademarks, or website content.

## Currently referenced upstream sources

The project README currently references resources hosted by `onthigplx.edu.vn`, including question JSON, traffic-sign data, and license configuration files.

These sources are external to GPLX and are not controlled by this repository.

## Important licensing rule

Publicly accessible data is not necessarily open-licensed data. Before redistributing an upstream dataset or bundling it in a release, contributors should verify the source's applicable terms, copyright status, attribution requirements, and any restrictions on automated access or redistribution.

The MIT license in this repository applies to GPLX-maintained software unless a file states otherwise. It does not grant rights to third-party datasets or media.

## Importer principles

GPLX import and normalization code should:

1. identify the upstream source explicitly;
2. avoid bypassing authentication, access controls, robots restrictions, or technical protections;
3. fail safely when an upstream schema changes;
4. record enough provenance to audit imported records;
5. avoid presenting third-party content as GPLX-owned;
6. support replacing an external source with a permitted local dataset where practical.

## Current normalization behavior

The backend can normalize question records, calculate SHA-256-based identifiers for duplicate handling, merge compatible metadata, normalize image URLs, import traffic-sign records, and build license/exam configuration used by the application.

## Contributions involving data

A pull request that adds or changes an upstream source should document:

- source URL and publisher;
- what is fetched;
- why the source is needed;
- known usage or redistribution terms;
- attribution required by the source;
- whether the data is stored, cached, transformed, or only accessed at runtime.

If usage rights are unclear, prefer contributing importer code, schemas, or synthetic fixtures rather than committing a copy of the dataset.
