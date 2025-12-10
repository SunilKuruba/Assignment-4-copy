const EMBEDDINGS_2D = "data/data_science_job_posts_2025_embeddings_2d.csv";
const EMBEDDINGS_FULL = "data/data_science_job_posts_2025_embeddings_full.csv";

const embeddingSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Job Embedding Space by Seniority",
  width: "container",
  data: { url: EMBEDDINGS_2D },

  transform: [
    {
      lookup: "id",
      from: {
        data: { url: EMBEDDINGS_FULL },
        key: "id",
        fields: [
          "salary_mid_scaled",
          "seniority_level_num",
          "status_clean",
          "status_hybrid",
          "status_on_site",
          "status_remote",
          "post_age_scaled"
        ]
      }
    },
    {
      calculate:
        "datum.status_remote == 1 ? 'remote' :" +
        "datum.status_hybrid == 1 ? 'hybrid' :" +
        "datum.status_on_site == 1 ? 'on-site' :" +
        "'unknown'",
      as: "status_label"
    }
  ],

  mark: { type: "point", filled: true, size: 40 },

  encoding: {
    x: { field: "x", type: "quantitative", title: "Embedding X" },
    y: { field: "y", type: "quantitative", title: "Embedding Y" },

    color: {
      field: "seniority_level_num",
      type: "nominal",
      title: "Seniority Level",
      scale: { scheme: "category10" } 
    },

    shape: {
      field: "status_label",
      type: "nominal",
      title: "Status"
    },

    tooltip: [
      { field: "id", type: "quantitative", title: "Job ID" },
      { field: "status_label", type: "nominal", title: "Status" },
      {
        field: "seniority_level_num",
        type: "nominal",
        title: "Seniority Level"
      },
      {
        field: "salary_mid_scaled",
        type: "quantitative",
        title: "Scaled Mid Salary"
      },
      {
        field: "post_age_scaled",
        type: "quantitative",
        title: "Post Age (scaled)"
      }
    ]
  }
};


const salarySpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Histogram Scaled Salaries",
  width: "container",

  data: { url: EMBEDDINGS_FULL },

  transform: [
    { filter: "datum.salary_mid_scaled >= 0 && datum.salary_mid_scaled <= 0.1" }
  ],

  mark: "bar",

  encoding: {
    x: {
      field: "salary_mid_scaled",
      type: "quantitative",
      bin: { extent: [0, 0.1], maxbins: 20 },
      title: "Scaled Mid Salary"
    },

    y: {
      aggregate: "count",
      type: "quantitative",
      title: "Number of Jobs"
    },

    color: {
      aggregate: "count",
      type: "quantitative",
      scale: { scheme: "blues" }
    }
  }
};

const stateMapIndustriesSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  vconcat: [
    {
      title: "Median Salary by State",
      width: "container",
      data: {
        url: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
        format: { type: "topojson", feature: "states" }
      },
      transform: [
        {
          lookup: "id",
          from: {
            data: { url: "data/v1_state_agg.csv" },
            key: "fips_int",
            fields: ["state", "median_salary", "n_jobs", "fips_int"]
          }
        }
      ],
      projection: { type: "albersUsa" },
      selection: {
        state_select: {
          type: "single",
          fields: ["fips_int"],
          empty: "none"
        }
      },
      mark: { type: "geoshape", stroke: "white" },
      encoding: {
        color: {
          field: "median_salary",
          type: "quantitative",
          title: "Median Salary",
          scale: { scheme: "blues" }
        },
        tooltip: [
          { field: "state", type: "nominal", title: "State" },
          {
            field: "median_salary",
            type: "quantitative",
            title: "Median Salary"
          },
          { field: "n_jobs", type: "quantitative", title: "# Jobs" }
        ]
      }
    },
    {
      title: "Top Industries in Selected State",
      width: "container",
      data: { url: "data/data_science_job_posts_2025_clean.csv" },
      transform: [{ filter: { selection: "state_select" } }],
      mark: "bar",
      encoding: {
        x: {
          field: "industry",
          type: "nominal",
          sort: "-y",
          title: "Industry",
          axis: { labelAngle: -40, labelLimit: 200 }
        },
        y: {
          aggregate: "count",
          type: "quantitative",
          title: "Job Postings"
        },
        color: { field: "industry", type: "nominal", legend: null },
        tooltip: [
          { field: "industry", type: "nominal", title: "Industry" },
          { aggregate: "count", type: "quantitative", title: "# Jobs in State" }
        ]
      }
    }
  ]
};

// Shared options
const EMBEDDING_DATA_URL = 'data/embeddings_umap_2d.csv';

const embedOpt = {
  actions: {
    export: true,
    source: false,
    compiled: false,
    editor: false
  }
};

// 1) Embedding scatterplot (UMAP)
const umapEmbeddingSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Job Embedding Space (UMAP Projection)',
  width: "container",
  data: { url: EMBEDDING_DATA_URL },
  params: [{ name: 'brush', select: 'interval' }],
  mark: { type: 'circle', size: 50, opacity: 0.6 },
  encoding: {
    x: {
      field: 'umap_x',
      type: 'quantitative',
      title: 'UMAP Dimension 1',
      scale: { zero: false }
    },
    y: {
      field: 'umap_y',
      type: 'quantitative',
      title: 'UMAP Dimension 2',
      scale: { zero: false }
    },
    color: {
      condition: {
        param: 'brush',
        field: 'experience_level',
        type: 'nominal',
        scale: { scheme: 'tableau10' },
        title: 'Experience Level'
      },
      value: 'lightgray'
    },
    tooltip: [
      { field: 'title', type: 'nominal', title: 'Job Title' },
      { field: 'salary', type: 'quantitative', title: 'Salary', format: '$,.0f' },
      { field: 'experience_level', type: 'nominal', title: 'Experience' },
      { field: 'work_type', type: 'nominal', title: 'Work Type' },
      { field: 'state', type: 'nominal', title: 'State' },
      { field: 'engagement_rate', type: 'quantitative', title: 'Engagement %', format: '.1f' }
    ]
  },
  config: {
    view: { strokeWidth: 0 },
    axis: { labelFontSize: 11, titleFontSize: 12 },
    title: { fontSize: 14, anchor: 'start' }
  }
};

// 2) Salary distribution
const salaryDistSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Salary Distribution',
  width: "container",
  data: { url: EMBEDDING_DATA_URL },
  mark: 'bar',
  encoding: {
    x: {
      field: 'salary',
      type: 'quantitative',
      bin: { maxbins: 25 },
      title: 'Salary ($)',
      axis: { format: '$,.0f' }
    },
    y: {
      aggregate: 'count',
      type: 'quantitative',
      title: 'Count'
    },
    color: { value: 'steelblue' },
    tooltip: [
      {
        field: 'salary',
        type: 'quantitative',
        bin: { maxbins: 25 },
        title: 'Salary',
        format: '$,.0f'
      },
      { aggregate: 'count', type: 'quantitative', title: 'Count' }
    ]
  },
  config: {
    view: { strokeWidth: 0 },
    axis: { labelFontSize: 11, titleFontSize: 12 },
    title: { fontSize: 14, anchor: 'start' }
  }
};

// 3) Experience level distribution
const experienceLevelSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Experience Level Distribution',
  width: "container",
  data: { url: EMBEDDING_DATA_URL },
  mark: 'bar',
  encoding: {
    y: {
      field: 'experience_level',
      type: 'nominal',
      title: 'Experience Level',
      sort: '-x'
    },
    x: {
      aggregate: 'count',
      type: 'quantitative',
      title: 'Number of Jobs'
    },
    color: {
      field: 'experience_level',
      type: 'nominal',
      scale: { scheme: 'tableau10' },
      legend: null
    },
    tooltip: [
      { field: 'experience_level', type: 'nominal', title: 'Experience' },
      { aggregate: 'count', type: 'quantitative', title: 'Count' },
      {
        field: 'salary',
        aggregate: 'mean',
        format: '$,.0f',
        title: 'Avg Salary'
      }
    ]
  },
  config: {
    view: { strokeWidth: 0 },
    axis: { labelFontSize: 11, titleFontSize: 12 },
    title: { fontSize: 14, anchor: 'start' }
  }
};

// 4) Work type distribution
const workTypeSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Work Type Distribution',
  width: "container",
  data: { url: EMBEDDING_DATA_URL },
  mark: 'bar',
  encoding: {
    y: {
      field: 'work_type',
      type: 'nominal',
      title: 'Work Type',
      sort: '-x'
    },
    x: {
      aggregate: 'count',
      type: 'quantitative',
      title: 'Number of Jobs'
    },
    color: {
      field: 'work_type',
      type: 'nominal',
      scale: { scheme: 'category20' },
      legend: null
    },
    tooltip: [
      { field: 'work_type', type: 'nominal', title: 'Work Type' },
      { aggregate: 'count', type: 'quantitative', title: 'Count' },
      {
        field: 'salary',
        aggregate: 'mean',
        format: '$,.0f',
        title: 'Avg Salary'
      }
    ]
  },
  config: {
    view: { strokeWidth: 0 },
    axis: { labelFontSize: 11, titleFontSize: 12 },
    title: { fontSize: 14, anchor: 'start' }
  }
};

// 5) Regional distribution
const regionSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Regional Distribution',
  width: "container",
  data: { url: EMBEDDING_DATA_URL },
  mark: 'bar',
  encoding: {
    y: {
      field: 'region',
      type: 'nominal',
      title: 'Region',
      sort: '-x'
    },
    x: {
      aggregate: 'count',
      type: 'quantitative',
      title: 'Number of Jobs'
    },
    color: {
      field: 'region',
      type: 'nominal',
      scale: { scheme: 'set2' },
      legend: null
    },
    tooltip: [
      { field: 'region', type: 'nominal', title: 'Region' },
      { aggregate: 'count', type: 'quantitative', title: 'Count' },
      {
        field: 'salary',
        aggregate: 'mean',
        format: '$,.0f',
        title: 'Avg Salary'
      }
    ]
  },
  config: {
    view: { strokeWidth: 0 },
    axis: { labelFontSize: 11, titleFontSize: 12 },
    title: { fontSize: 14, anchor: 'start' }
  }
};

vegaEmbed("#vis1", embeddingSpec);
vegaEmbed("#vis2", salarySpec);
vegaEmbed("#vis3", stateMapIndustriesSpec);
vegaEmbed('#vis4', umapEmbeddingSpec, embedOpt);
vegaEmbed('#vis5', salaryDistSpec, embedOpt);
vegaEmbed('#vis7', experienceLevelSpec, embedOpt);
vegaEmbed('#vis8', workTypeSpec, embedOpt);
vegaEmbed('#vis9', regionSpec, embedOpt);

