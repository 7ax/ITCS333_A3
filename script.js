const API_URL =
  "https://data.gov.bh/api/explore/v2.1/catalog/datasets/01-statistics-of-students-nationalities_updated/records?where=colleges%20like%20%22IT%22%20AND%20the_programs%20like%20%22bachelor%22&limit=100";

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

async function fetchData() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error-message");
  const dataContainer = document.getElementById("data-container");
  const chartContainer = document.getElementById("chart-container");

  try {
    loadingEl.classList.remove("d-none");
    errorEl.classList.add("d-none");
    dataContainer.classList.add("d-none");
    chartContainer.classList.add("d-none");

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched Data:", data); 

    const records = Array.isArray(data.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];
    console.log("Records Array:", records);

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("No records found in the dataset.");
    }

    // Hide loading
    loadingEl.classList.add("d-none");

    // Render table
    renderTable(records);
    dataContainer.classList.remove("d-none");

    // Render chart
    renderChart(records);
    chartContainer.classList.remove("d-none");
  } catch (error) {
    console.error("Error fetching data:", error);
    loadingEl.classList.add("d-none");
    errorEl.classList.remove("d-none");
  }
}

function renderTable(records) {
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  // Populate table rows
  records.forEach((record) => {
    // Adjust field names if needed based on console.log output
    const year = record.year || "N/A";
    const semester = record.semester || "N/A";
    const nationality = record.nationality || "N/A";
    const colleges = record.colleges || "N/A";
    const number_of_students =
      record.number_of_students !== undefined
        ? Number(record.number_of_students).toLocaleString()
        : "N/A";

    const row = document.createElement("tr");
    appendCell(row, year);
    appendCell(row, semester);
    appendCell(row, nationality);
    appendCell(row, colleges);
    appendCell(row, number_of_students);
    tableBody.appendChild(row);
  });

  // Initialize DataTable
  $("#data-table").DataTable({
    responsive: true,
    pageLength: 10,
    language: {
      search: "Search:",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries",
      paginate: {
        previous: "Previous",
        next: "Next",
      },
    },
  });
}

function appendCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

// Initialize the global variable for the chart
let studentsChart = null;

function renderChart(records) {
    console.log("Rendering Chart with records:", records);
  
    const ctx = document.getElementById('studentsChart').getContext('2d');
  
    // Initialize a dictionary to aggregate student counts by nationality
    const nationalityCounts = {};
  
    // Iterate through records to aggregate data
    records.forEach(record => {
      // Adjust the keys based on the API response structure
      const fields = record.fields || record; // Use 'fields' if it exists, fallback to record
      const nationality = fields.nationality || 'Unknown'; // Default to 'Unknown'
      const count = parseFloat(fields.number_of_students) || 0; // Ensure numeric data
  
      // Aggregate student counts by nationality
      nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + count;
    });
  
    const labels = Object.keys(nationalityCounts); // Extract nationalities as labels
    const dataCounts = Object.values(nationalityCounts); // Extract aggregated counts as data
  
    // Debugging logs
    console.log("Chart Labels:", labels);
    console.log("Chart Data Counts:", dataCounts);
  
    // Check for missing data
    if (!labels.length || !dataCounts.length) {
      console.warn("No valid data available for the chart.");
      return; // Exit if no valid data
    }
  
    // Create a color palette
    const colors = [
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)'
    ];
  
    const backgroundColors = labels.map((_, i) => colors[i % colors.length]);
    const borderColors = backgroundColors.map(c => c.replace('0.7)', '1)')); // Darker border
  
    // Check if chart already exists and destroy it
    if (studentsChart) {
      studentsChart.destroy();
    }
  
    // Create a new chart
    studentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Students',
          data: dataCounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Number of Students by Nationality',
            font: { size: 18 },
            color: '#333'
          },
          tooltip: {
            enabled: true
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#333',
              font: { size: 14 }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#333',
              font: { size: 14 },
              precision: 0
            }
          }
        }
      }
    });
  
    console.log("Chart initialized successfully!");
  }
  