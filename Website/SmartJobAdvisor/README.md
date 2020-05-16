# Smart Job Advisor Website

This is the user-facing front end of the Smart Job Advisor Project. It allows users to input information about print jobs to our Rules Engine, which will determine what the optimal press settings for the job will be, along with justifications for why the choices were made.

A hosted version of the site exists if you are unable to build it: <br/>
[http://ec2-3-22-222-29.us-east-2.compute.amazonaws.com:3000/](http://ec2-3-22-222-29.us-east-2.compute.amazonaws.com:3000/)

# Requirements to Build

- You MUST have Visual Studio 2019 installed to be able to render the site with IIS Express.
  - OLDER VERSIONS OF VISUAL STUDIO MAY NOT WORK!
- You need Node.js/npm
- Additional packages required to render the site are installed with npm (in the next section)

# How to Build

1. Clone the repository using the following command: <br/>
`git clone https://github.com/KuanYuLai/Senior-Project.git`
2. Move into the SmartJobAdvisor folder: <br/>
`cd Senior-Project/Website/SmartJobAdvisor`
3. Build node modules by running the command `npm i`
4. (optional) Run the command `npm audit fix`
5. Move into the ClientApp folder: `cd ClientApp`
6. Build node modules by running the command `npm i`
7. (optional) Run the command `npm audit fix`
8. Open the file `SmartJobAdvisor.sln` with Visual Studio 2019
9. Render the site by clicking `IIS Express` at the top of VS (Green 'play' button)

# How to Use

The website is fairly straightforward. You will land on a splash screen providing two options:
- `Add New Job`
- `View History`


The `Add New Job` button takes you to the New Job page, which contains a form for users to fill out for the print job being generated. The 'View History' button brings you to a page that displays all of the previously-run jobs in a table, and allows you to view one or more.

### New Job

- **General Info:**  generic info about the PDF
  - **Upload PDFs:**  allows the user to upload PDF files for analysis. If PDF files are uploaded, then Job Name and PDF Max Coverage are disabled, since those values will be calculated from the PDF (name of PDF is Job Name, Max Coverage obtained from the /analyze-pdf endpoint in the backend)
  - **Job Name:**  the name of the job to be generated (remembered with cookie)
  - **Ruleset:**  the ruleset to use (i.e. the printing press being used;  remembered with cookie)
  - **Quality Mode:**  the quality mode of the printer (higher quality vs. faster printing;  remembered with cookie)
  - **Press Unwinder Brand:**  the brand of unwinder used by the printing press (remembered with cookie)
  - **PDF Max Coverage:**  the highest coverage percent (ratio of ink to page) of any page in the PDF (remembered with cookie)
  - **Optical Density:**  the transparency of the ink (typically a high value, unable to go below 50%;  remembered with cookie)
- **Paper Selections:**  the paper to be used in the print job (options narrow down as they are selected so only valid options are available)
  - **Unknown Paper?:**  if the user wants to use a paper that's not  in the database, they can click this checkbox (disables Mfr and Name, changes Weight from dropdown list to slider)
  - **Recent Papers:**  a dropdown list containing the 10 last-used papers (remembered with cookie)
  - **Mfr:**  the manufacturer of the selected paper
  - **Name:**  the name of the selected paper
  - **Type:**  the coating type of the selected paper
  - **Sub-Type:**  the type of the paper (bond/cover/news/text)
  - **Weight:**  the weight of the paper in GSM (grams per square meter)
  - **Finish:**  the finish for the selected paper (gloss/matte/silk/etc.)

The New Job form also has info popups next to each form item to explain its meaning.

Both sections have a reset button, which resets the form values only in that section.

When finished filling out the form, press the 'Submit' button to pass the input to the SmartJobAdvisor Engine. When the button is pressed, the form values are displayed in the console (Ctrl + Shift + i) along with the ID that was passed back from the SmartJobAdvisor Engine. You will be brought to a new screen, Job Results.

### Job Results

The Job Results page contains the output of the Rules Engine for the job that was just submitted, contained in a datasheet that is copyable for use with Excel.

There are three buttons on this page:
- **Export to CSV:**  exports the current contents of the spreadsheet into a CSV named "Job_#.csv"
- **Copy Link to Clipboard:**  copies the link to the page, for each of sharing
- **Justifications?:**  toggles the justifications column (enabled by default)

The URL for this page determines what job is being displayed and if justifications are on<br/>
The whole URL is as follows:
`http://ec2-3-22-222-29.us-east-2.compute.amazonaws.com:3000/job-results?justifications=true?IDs=3`
- `?justifications=true`:  determines whether or not to show justifications
- `?IDs=3`:  determines which job(s) to show. Multiple jobs like `?IDs=3,4,5`

### Job History

The Job History page contains all job that have been run to-date, held in a table sorted by Job ID in descending order (this order is also chronological, from most to least-recent).

To view the output of a single job, click on the magnifying glass icon on the right. The view is exactly the same as the Job Results page, just in a popup modal instead. By default, single jobs have justifications enabled, and comparisons of multiple jobs have justifications disabled.

To compare multiple jobs, select jobs by clicking on the row or checkbox. Two buttons will appear: <br/>
- **Compare:**  opens the jobs (like the magnifying glass) in a spreadsheet side-by-side for ease of comparison. Justifications off by default
- **Deselect:**  clears the row selection
- **Delete:**  deletes the jobs from the database. Job IDs continue to increment, so that no two jobs will ever have the same ID

There is also a 'Columns' button to choose the default columns to display (remembered with cookie). The default columns are Job ID, Date, and Job Name. They cannot be unselected.

