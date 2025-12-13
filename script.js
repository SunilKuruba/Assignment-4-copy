// ============================================================================
// JOB MARKET EMBEDDING EXPLORER - LINKED VEGA-LITE VISUALIZATIONS
// ============================================================================

// Create a single concatenated spec with shared selections
const dashboardSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: {url: 'data/embeddings_umap_2d.csv'},
  params: [{name: 'brush', select: 'interval'}],
  vconcat: [
    // ========================================================================
    // 1. MAIN EMBEDDING SCATTERPLOT
    // ========================================================================
    {
      title: {
        text: 'Job Embedding Space (UMAP Projection)',
        subtitle: 'Brush to select jobs and filter views below',
        fontSize: 18
      },
      width: 900,
      height: 500,
      mark: {type: 'circle', size: 50, opacity: 0.6},
      encoding: {
        x: {
          field: 'umap_x',
          type: 'quantitative',
          title: 'UMAP Dimension 1',
          scale: {zero: false}
        },
        y: {
          field: 'umap_y',
          type: 'quantitative',
          title: 'UMAP Dimension 2',
          scale: {zero: false}
        },
        color: {
          condition: {
            param: 'brush',
            field: 'experience_level',
            type: 'nominal',
            scale: {scheme: 'tableau10'},
            title: 'Experience Level'
          },
          value: 'lightgray'
        },
        tooltip: [
          {field: 'title', type: 'nominal', title: 'Job Title'},
          {field: 'salary', type: 'quantitative', title: 'Salary', format: '$,.0f'},
          {field: 'experience_level', type: 'nominal', title: 'Experience'},
          {field: 'work_type', type: 'nominal', title: 'Work Type'},
          {field: 'state', type: 'nominal', title: 'State'},
          {field: 'engagement_rate', type: 'quantitative', title: 'Engagement %', format: '.1f'}
        ]
      }
    },
    
    // ========================================================================
    // 2. LINKED VIEWS ROW 1: Salary + Experience
    // ========================================================================
    {
      hconcat: [
        {
          title: 'Salary Distribution',
          width: 440,
          height: 250,
          transform: [{filter: {param: 'brush'}}],
          mark: 'bar',
          encoding: {
            x: {
              field: 'salary',
              type: 'quantitative',
              bin: {maxbins: 25},
              title: 'Salary ($)',
              axis: {format: '$,.0f'}
            },
            y: {
              aggregate: 'count',
              type: 'quantitative',
              title: 'Count'
            },
            color: {value: 'steelblue'},
            tooltip: [
              {field: 'salary', type: 'quantitative', bin: {maxbins: 25}, title: 'Salary', format: '$,.0f'},
              {aggregate: 'count', type: 'quantitative', title: 'Count'}
            ]
          }
        },
        {
          title: 'Experience Level Distribution',
          width: 440,
          height: 250,
          transform: [{filter: {param: 'brush'}}],
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
              scale: {scheme: 'tableau10'},
              legend: null
            },
            tooltip: [
              {field: 'experience_level', type: 'nominal', title: 'Experience'},
              {aggregate: 'count', type: 'quantitative', title: 'Count'},
              {field: 'salary', aggregate: 'mean', format: '$,.0f', title: 'Avg Salary'}
            ]
          }
        }
      ]
    },
    
    // ========================================================================
    // 3. LINKED VIEWS ROW 2: Work Type + Region
    // ========================================================================
    {
      hconcat: [
        {
          title: 'Work Type Distribution',
          width: 440,
          height: 250,
          transform: [{filter: {param: 'brush'}}],
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
              scale: {scheme: 'category20'},
              legend: null
            },
            tooltip: [
              {field: 'work_type', type: 'nominal', title: 'Work Type'},
              {aggregate: 'count', type: 'quantitative', title: 'Count'},
              {field: 'salary', aggregate: 'mean', format: '$,.0f', title: 'Avg Salary'}
            ]
          }
        },
        {
          title: 'Regional Distribution',
          width: 440,
          height: 250,
          transform: [{filter: {param: 'brush'}}],
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
              scale: {scheme: 'set2'},
              legend: null
            },
            tooltip: [
              {field: 'region', type: 'nominal', title: 'Region'},
              {aggregate: 'count', type: 'quantitative', title: 'Count'},
              {field: 'salary', aggregate: 'mean', format: '$,.0f', title: 'Avg Salary'}
            ]
          }
        }
      ]
    },
    
    // ========================================================================
    // 4. SUMMARY STATISTICS
    // ========================================================================
    {
      title: 'Selection Summary',
      width: 900,
      height: 80,
      transform: [
        {filter: {param: 'brush'}},
        {
          aggregate: [
            {op: 'count', as: 'count'},
            {op: 'mean', field: 'salary', as: 'avg_sal'},
            {op: 'median', field: 'salary', as: 'med_sal'},
            {op: 'mean', field: 'engagement_rate', as: 'avg_eng'},
            {op: 'sum', field: 'remote', as: 'remote_count'}
          ]
        },
        {
          calculate: 'datum.remote_count / datum.count * 100',
          as: 'remote_pct'
        },
        {
          calculate: '"Jobs: " + format(datum.count, ",") + "  |  Avg Salary: $" + format(datum.avg_sal, ",.0f") + "  |  Median: $" + format(datum.med_sal, ",.0f") + "  |  Avg Engagement: " + format(datum.avg_eng, ".1f") + "%  |  Remote: " + format(datum.remote_pct, ".1f") + "%"',
          as: 'summary_text'
        }
      ],
      mark: {type: 'text', fontSize: 14, align: 'center', fontWeight: 'bold'},
      encoding: {
        text: {field: 'summary_text', type: 'nominal'},
        y: {value: 40},
        color: {value: '#2c3e50'}
      }
    }
  ],
  config: {
    view: {strokeWidth: 0},
    axis: {labelFontSize: 11, titleFontSize: 12},
    title: {fontSize: 14, anchor: 'start'}
  }
};

// ============================================================================
// RENDER THE DASHBOARD
// ============================================================================

const embedOpt = {
  actions: {
    export: true,
    source: false,
    compiled: false,
    editor: false
  }
};

vegaEmbed('#embedding-view', dashboardSpec, embedOpt)
  .then(result => {
    console.log('✓ Dashboard loaded successfully!');
    console.log('Try brushing (click and drag) on the embedding scatterplot');
  })
  .catch(error => {
    console.error('✗ Error loading dashboard:', error);
    document.getElementById('embedding-view').innerHTML = 
      '<div style="color: red; padding: 20px;">' +
      '<h3>Error loading visualization</h3>' +
      '<p>' + error + '</p>' +
      '</div>';
  });
