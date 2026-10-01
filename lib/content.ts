// Everything on the site except projects lives here. Projects are managed from /admin.
// Wrap a phrase in **double asterisks** to highlight it.

export const profile = {
  name: "Vedant Singh",
  role: "Software & Data Engineer",
  location: "Gurugram, Haryana",
  coords: "28.46°N 77.03°E",
  email: "vedant.singh0162@gmail.com",
  phone: "+91 91213 14162",
  linkedin: "https://www.linkedin.com/in/vedant-singh-0162v0162/",
  credly: "https://www.credly.com/users/vedant-singh.e162222d/badges/credly",
  resume: "/Vedant_Singh_Resume.pdf",
  intro:
    "Software & Data Engineer at GlobalLogic, on-site with Google. I design the pipelines that turn half a billion messy rows a day into tables people can actually trust.",
  bio: [
    "I started out validating the datasets behind **Search AI and Knowledge Graph** systems, the unglamorous work of checking what the data really says. That habit stuck.",
    "Today I architect **Medallion pipelines on Databricks and GCP**: raw data lands in Bronze, gets cleaned and joined in Silver, and comes out in Gold ready for dashboards and models. Along the way I've cut ETL runtime by **~25%**, made BigQuery dashboards **30% faster**, and put **Gemini** to work on the review and documentation nobody wants to do by hand.",
  ],
  recordsPerDay: 500_000_000,
};

export type SkillGroup = { group: string; items: string[] };

export const skills: SkillGroup[] = [
  { group: "Languages", items: ["Python", "SQL", "Java"] },
  {
    group: "Data engineering",
    items: ["ETL Pipeline Design", "Databricks", "PySpark", "Medallion Architecture", "Star Schema", "SCD Type 2", "CDC"],
  },
  {
    group: "Cloud & GCP",
    items: ["Google Cloud", "BigQuery", "Dataproc", "Cloud Storage", "Delta Lake", "Cloud Data Fusion"],
  },
  { group: "Databases", items: ["MySQL", "SQL Server", "Snowflake"] },
  {
    group: "Applied AI",
    items: ["Gemini", "Generative AI", "LLMs", "Prompt Engineering", "RAG", "Agentic AI", "LangChain", "Knowledge Graphs", "Search AI"],
  },
  {
    group: "Tools & DevOps",
    items: ["Git", "GitHub", "CI/CD", "Docker", "Kubernetes", "Pentaho (PDI)", "Power BI", "REST APIs", "Web Scraping"],
  },
];

// How some skills look before cleaning, for the raw → clean demo in the Bronze section.
export const dirtySpellings: Record<string, string> = {
  Python: "python ",
  PySpark: "PYSPARK",
  BigQuery: "big query",
  Kubernetes: "k8s",
  "Generative AI": "gen-ai",
  "Google Cloud": "gcp",
  "SQL Server": "sqlserver",
  "CI/CD": "ci cd",
  LangChain: "langchain",
};

// Rows the "pipeline" drops: nulls and a duplicate.
export const junkRows = [
  { raw: "NULL", reason: "null" },
  { raw: "Python", reason: "duplicate" },
  { raw: "n/a", reason: "null" },
] as const;

export const metrics = [
  { value: 500, suffix: "M+", label: "records processed a day" },
  { value: 25, suffix: "%", label: "less ETL processing time" },
  { value: 30, suffix: "%", label: "faster BI queries" },
  { value: 100, suffix: "+", label: "sources crawled & scraped" },
  { value: 5, suffix: "+", label: "Java codebases moved to Python" },
  { value: 4, suffix: "×", label: "awards at GlobalLogic" },
];

export const experience = [
  {
    role: "Software Engineer",
    company: "GlobalLogic",
    client: "Google",
    place: "Gurugram, Haryana",
    period: "Oct 2025 – Sep 2026",
    points: [
      "Architected end-to-end **Medallion (Bronze/Silver/Gold) pipelines** on Databricks and GCP using PySpark, Delta Lake and BigQuery, processing **500M+ records a day**.",
      "Orchestrated and optimized **10+ production pipelines** in Python and SQL, cutting ETL processing time **~25%** and improving validation accuracy.",
      "Added error handling, logging and alerting across 10+ orchestration and PySpark pipelines, improving SLA compliance and reliability.",
      "Optimized Star Schema models in BigQuery, lifting BI query performance **30%** and speeding up Looker Studio refreshes.",
      "Built web scraping and crawling for **100+ sources**; migrated **5+ legacy Java codebases** to Python.",
      "Used **Gemini and Generative AI** with prompt engineering to automate content analysis, validation and documentation across 5–6 daily pipelines.",
    ],
  },
  {
    role: "Analyst",
    note: "Promoted from Associate Analyst",
    company: "GlobalLogic",
    place: "Gurugram, Haryana",
    period: "Sep 2023 – Sep 2025",
    points: [
      "Analyzed and validated large-scale datasets powering **Search AI and Knowledge Graph** systems.",
      "Automated data validation and structured extraction in Python across **100+ websites**, reducing manual collection.",
      "Built and maintained **Pentaho (PDI)** ETL workflows, the foundation later scaled into Medallion pipelines.",
      "Streamlined data quality review with Pentaho and SQL, cutting manual review effort **~30%**.",
    ],
  },
];

export const certifications = [
  { name: "Professional Cloud Architect", issuer: "Google Cloud" },
  { name: "Associate Cloud Engineer", issuer: "Google Cloud" },
  { name: "GitHub Foundations", issuer: "Microsoft" },
];

export const awards = [
  { count: "2×", name: "Monthly Reward & Recognition" },
  { count: "2×", name: "On-the-Spot Award" },
];

export const education = {
  degree: "Bachelor of Computer Applications (BCA)",
  school: "Dr. VSICS, Kanpur",
  period: "2020 – 2023",
  coursework: "Database Management Systems, Data Structures, Operating Systems",
};
