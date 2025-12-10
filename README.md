# Visual Analytics of LinkedIn Job Postings

<img width="795" height="400" alt="image" src="https://github.com/user-attachments/assets/077ad007-75a7-4be1-8563-da23ba6e1783" />

## Group Information  

| Name         | UIN       | Email             | Contribution |
|--------------|-----------|-------------------|--------------|
| Sunil Kuruba | 659375633 | skuru@uic.edu     |  |
| Richa Rameshkrishna   | 651622805    | rrame11@uic.edu   |  |

---

<TBD: Instructions to run>

## **Dataset: LinkedIn Job Postings**

The **LinkedIn Job Postings** dataset provides a detailed and expansive view of over **124,000 job postings** collected across **2023 and 2024**, enriched with extensive company, skill, industry, salary, and benefits metadata. Each posting includes attributes such as job title, full job description text, posting recency, employment type (remote, hybrid, full-time, contract), seniority indicators, and direct application links. Additional relational tables augment each posting with company-level details—such as company size, employee and follower counts, headquarters location, and industry classification—as well as structured skill requirements extracted from the listing. The richness and structure of this dataset make it inherently multi-dimensional, enabling not only job-specific analysis but also exploration of broader ecosystems of employers, regional markets, and industry-wide patterns. Its two-year temporal span further supports studying seasonal hiring patterns, emerging trends, and year-over-year changes.

We found this dataset particularly valuable because it bridges several domains of interest, including labor-market analytics, skill-demand forecasting, geographic hiring trends, and compensation insights—all of which are especially relevant in the evolving job landscape. Unlike a basic job-listing feed, this dataset enables layered exploration: comparing startup vs. enterprise hiring behaviors, identifying geographic concentrations of specific roles, measuring the rise of remote-first work models, and analyzing how certain skills correspond to higher salary bands. The presence of rich text fields such as job descriptions and skill tags also allows more advanced processing, including keyword extraction, embeddings, clustering, and visualization of demand patterns. Together, the dataset’s scale, variety, and recency make it an ideal foundation for building meaningful, insight-driven visualizations that reveal how opportunities and requirements in the data-driven job market are shifting over time.

## **Embeddings Construction**

To prepare the dataset for similarity analysis and interactive visualization, every job posting was transformed into a structured numeric embedding. This embedding captures skills, salary, seniority, geography, industry, and several other interpretable characteristics of each job. 

### **Skills (Top-50 Multi-Hot Encoding)**
The skills listed in the `skills_clean` column were split into individual tokens, standardized to lowercase, and used to build a vocabulary of the fifty most frequent skills across the dataset. Each of these skills was then converted into a separate binary column (e.g., `skill_python`, `skill_sql`, `skill_machine_learning`), indicating whether the job mentions that skill. This representation creates an expressive but compact summary of each job’s technical expectations and allows similar roles to cluster together based on shared skill requirements.

### **Salary (Min–Max Scaled)**
The cleaned midpoint salary (`salary_mid`) was converted into a numeric field and scaled to the [0,1] range using min–max normalization. This ensures that salary contributes to the embedding in a balanced way without overwhelming the binary fields. The scaling also preserves meaningful trends such as high-salary clusters while maintaining numerical stability across models and projection methods.

### **Seniority Level (Mapped to 1–4)**
The normalized seniority category (`seniority_level_norm`) was mapped to an integer scale where junior, mid-level, senior, and lead correspond to values 1 through 4. Missing entries were replaced using the median of the dataset to maintain a consistent representation. This numerical encoding helps distinguish between early-career and more advanced roles while keeping the embedding structure simple and interpretable.

### **Work Arrangement (Hybrid / On-Site / Remote)**
The job’s work arrangement was standardized and converted into three one-hot encoded features (`status_hybrid`, `status_on_site`, `status_remote`). This makes it possible to compare roles based on their level of flexibility, and it also helps identify patterns such as remote-heavy clusters or on-site-dominant industries.

### **Industry Category (Selected One-Hot Encoding)**
A focused set of major industries—such as Technology, Finance, Healthcare, Retail, and Manufacturing—was encoded into one-hot columns. This avoids the explosion of categories that would come from using every industry label in the dataset while still capturing the most meaningful sector-level distinctions that influence job similarities.

### **Ownership Type (One-Hot Encoding)**
The ownership information was cleaned, normalized, and expanded into one-hot indicators such as `ownership_Private`, `ownership_Public`, and `ownership_nan`. This allows the embedding to reflect differences between start-ups, private companies, and public corporations, which often correlate with salary ranges, role expectations, and company size.

### **Location (State-Level One-Hot Encoding)**
US state abbreviations were standardized and converted into one-hot columns (e.g., `state_CA`, `state_NY`). This provides a coarse but meaningful geographical distinction and allows the embedding to capture regional hiring patterns, salary variations, and local job market characteristics.

### **Company Size Bucket (Small / Medium / Large / Very Large)**
Company size values were parsed and grouped into four meaningful buckets based on approximated employee counts. Each bucket was encoded as a one-hot feature, allowing the embedding to differentiate small start-ups from enterprise-scale employers. This improves similarity comparisons because job roles often change significantly based on organizational scale.

### **Posting Recency (Parsed and Scaled)**
Human-readable timestamps like “17 days ago” or “30+ days ago” were converted into numeric day counts and normalized. This recency feature captures how up-to-date each posting is and helps cluster jobs based on activity levels in the labor market. Older posts were assigned the maximum observed value to maintain consistency.

### **FIPS Region Code (Scaled Continuous Feature)**
The integer FIPS code, representing a geographic region, was converted to numeric and scaled to the [0,1] range. Although coarse, this feature introduces additional spatial structure and complements the one-hot state encoding by offering a continuous location signal.

### **Job Title Flags (Job Family Indicators)**
The job title was inspected for keywords such as “data scientist,” “data engineer,” “machine learning engineer,” and “analyst.” Each check produced a binary flag indicating membership in a job family. These flags help cluster visually similar roles together even when companies use inconsistent naming conventions.

### Feature Engineering Philosophy - Part 2 (Richa)

**Objective**: Create embeddings that capture job similarity based on compensation, requirements, geographic location, and engagement patterns.

**Rationale**: Two jobs are considered similar if they:
- Offer comparable salaries and engagement levels
- Require similar experience levels
- Are of the same work type (full-time vs contract)
- Are located in the same geographic region
- Have similar title characteristics (keywords indicating role type)

### Embedding Features (35 dimensions total)

#### 1. Numeric Features (4 dimensions)
- **`salary_log`**: Log-transformed salary for better scale distribution
- **`engagement_rate`**: Percentage of viewers who applied (0-100%)
- **`views_log`**: Log-transformed view count
- **`applies_log`**: Log-transformed application count

**Justification**: Log transformation handles skewed distributions common in salary and view counts. Engagement rate captures job attractiveness.

#### 2. Experience Level (6 dimensions, one-hot encoded)
- Entry level, Associate, Mid-Senior level, Director, Executive, Internship

**Justification**: Experience level is a strong differentiator of job similarity. One-hot encoding preserves categorical independence.

#### 3. Work Type (7 dimensions, one-hot encoded)
- Full-time, Contract, Part-time, Temporary, Internship, Other, Volunteer

**Justification**: Work arrangement fundamentally affects job nature (benefits, stability, duration).

#### 4. Remote Status (1 dimension, binary)
- 0 = On-site only, 1 = Remote allowed

**Justification**: Remote work capability significantly impacts job applicability and similarity.

#### 5. Geographic Region (5 dimensions, one-hot encoded)
- Northeast, Southeast, Midwest, Southwest, West

**Justification**: Grouped states into regions to reduce dimensionality while preserving geographic patterns. Regional grouping captures cost-of-living and market similarities better than 50 individual states.

**Region Mapping**:
- **Northeast**: New England + Mid-Atlantic (ME, NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD, DC)
- **Southeast**: Southern Atlantic + Gulf Coast (WV, VA, KY, TN, NC, SC, GA, FL, AL, MS, LA, AR)
- **Midwest**: Great Lakes + Plains (OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS)
- **Southwest**: TX, OK, NM, AZ
- **West**: Mountain + Pacific (CO, WY, MT, ID, UT, NV, CA, OR, WA, AK, HI)

#### 6. Job Title Keywords (12 dimensions, binary)
Keywords indicating role level and function:
- Level indicators: `senior`, `junior`, `lead`, `manager`, `director`
- Functions: `engineer`, `developer`, `analyst`, `scientist`, `designer`
- Domains: `data`, `software`

**Justification**: Title keywords reveal role seniority and technical domain without requiring complex NLP. Simple substring matching provides robust signal.

### Normalization

All 35 features were standardized using `StandardScaler` (mean=0, std=1) to ensure:
- Equal contribution from all feature types
- Compatibility with distance-based dimensionality reduction
- Numerical stability

Missing values (primarily from one-hot encoding) were filled with 0.


### **

## **Dimensionality Reduction**

For reducing the high-dimensional embedding matrix into something visually meaningful, We used **Principal Component Analysis (PCA)** as the sole dimensionality reduction method. PCA transforms dozens of engineered features—skills, industry flags, work arrangements, salary, seniority, geographic signals, and job-title indicators—into just two components that capture the strongest patterns in the data. It does this by identifying the directions of greatest variance in the original feature space, ensuring that the 2D coordinates (`x`, `y`) preserve as much of the dataset’s structure as possible. The method is computationally efficient, reproducible, deterministic, and works well with the mix of numeric and one-hot encoded fields in the embedding.

We specifically chose PCA because it produces stable, interpretable layouts that emphasize the **global shape** of the data. Unlike nonlinear methods such as t-SNE or UMAP—which can create visually appealing but highly sensitive and non-reproducible projections—PCA generates the same result every time, making it ideal for assignments, comparisons, and debugging. It also highlights major structural groupings, such as clusters of data-science roles with similar skill sets, high-salary regions, or remote-heavy sectors, without requiring heavy parameter tuning. In short, PCA provides the most reliable balance between clarity, computational simplicity, and visual interpretability for exploring this dataset.

To create the visualization-ready representation, Principal Component Analysis (PCA) was applied to the high-dimensional embedding matrix. We used `n_components=2` to obtain a two-dimensional projection and set `random_state=42` to keep the layout stable across runs. The resulting coordinates (`x`, `y`) were saved in `data_science_job_posts_2025_embeddings_2d.csv`.

### Methods Compared - Part 2 (Richa)

Three dimensionality reduction methods were applied to project the 35-dimensional embeddings into 2D for visualization:

#### 1. PCA (Principal Component Analysis)
**Parameters**: 2 components, random_state=42

**Results**:
- PC1 explained variance: 9.00%
- PC2 explained variance: 6.78%
- **Total variance explained: 15.78%**

**Characteristics**:
- Linear projection preserving global structure
- Fast computation (handles all 22,785 records)
- Interpretable axes (linear combinations of features)

**Observations**: 
- Low variance explained indicates high-dimensional complexity
- Jobs spread along PC1 (likely salary/experience gradient)
- Overlap between clusters suggests nonlinear relationships

#### 2. t-SNE (t-Distributed Stochastic Neighbor Embedding)
**Parameters**: perplexity=30, max_iter=1000, random_state=42

**Sample size**: 10,000 jobs (for computational efficiency)

**Characteristics**:
- Nonlinear, preserves local neighborhoods
- Creates tight, well-separated clusters
- Emphasizes local structure over global relationships

**Observations**:
- Clear separation between experience levels (Entry vs Executive form distinct clusters)
- Work types create sub-clusters within experience levels
- Strong visual clustering but distances between clusters not meaningful

#### 3. UMAP (Uniform Manifold Approximation and Projection)
**Parameters**: n_neighbors=15, min_dist=0.1, random_state=42

**Sample size**: 10,000 jobs

**Characteristics**:
- Nonlinear, balances local and global structure
- Preserves both neighborhoods and broader topology
- Faster than t-SNE, more interpretable distances

**Observations**:
- **Selected for final interface** - best balance of cluster separation and global structure
- Experience levels form distinct regions with smooth transitions
- Geographic regions visible as overlapping distributions within experience clusters
- Outliers (unusual job combinations) clearly identifiable

### Final Choice: UMAP

**Rationale**: UMAP was selected for the main interface because:
1. **Interpretable structure**: Clear experience-level clusters with meaningful spatial relationships
2. **Outlier detection**: Unusual jobs (e.g., high-salary entry-level) appear at cluster boundaries
3. **Computational efficiency**: Handles 10,000 points smoothly in browser
4. **Smooth transitions**: Gradual changes between related jobs (better for exploration than t-SNE's hard boundaries)

---

## Iteration Log: Embedding Development Process

### Iteration 1: Initial Attempt (Failed)
**Features**:
- Raw salary, views, applies (no log transformation)
- All 50 states as separate one-hot features
- No title keywords

**Dimensionality Reduction**: PCA only

**Issues**:
- PCA variance explained: 11% (very low)
- Salary outliers dominated the embedding space
- 50 state features created sparsity (many states had <10 jobs)
- No clear clustering in 2D projection

**Why it failed**: High variance in numeric features and sparse categorical features created noisy embeddings. Raw salary values ($20K-$500K) dominated distance calculations.

### Iteration 2: Improved Features (Partial Success)
**Changes**:
- Added log transformation for salary, views, applies
- Grouped states into 5 regions
- Added t-SNE and UMAP projections
- Still no title features

**Results**:
- UMAP showed clear experience-level clustering
- Regional patterns emerged but overlapped significantly
- Work type clusters visible within experience levels

**Issues**:
- Similar jobs (e.g., "Senior Data Scientist" in CA vs NY) not grouping well
- Missing semantic information from job titles
- Remote vs on-site jobs mixed within clusters

**Why partial**: Dimensionality reduction worked well, but embeddings lacked semantic richness.

### Iteration 3: Final Version (Success)
**Changes**:
- Added 12 title keyword features
- Added explicit remote binary feature
- Increased UMAP n_neighbors from 5 to 15 (smoother clusters)
- Adjusted min_dist from 0.3 to 0.1 (tighter clusters)

**Effect on embeddings**:
- Title keywords created meaningful sub-clusters (e.g., "data scientist" jobs grouped separately from "software engineer")
- Remote jobs formed distinguishable patterns (higher engagement rates)
- UMAP parameter tuning created visually clearer structure

**Effect on visualizations**:
- Brushing now reveals coherent job groups (e.g., "all remote senior engineering jobs in West region")
- Outliers interpretable (e.g., high-salary contract internships)
- Smooth gradients in salary across embedding space

**Final quality**: PCA variance increased to 15.78%, UMAP clusters visually distinct and semantically meaningful.


<TBD> Encodings, interactions, and initial findings (e.g., discovered clusters, outliers, patterns).
<TBD> A brief explanation of how your standalone HTML interface is organized.
<TBD> embedded website/screenshot
