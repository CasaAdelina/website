import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let selectedStartDate = null;
let selectedEndDate = null;
let blockedDates = [];

const firebaseConfig = {
    apiKey: "AIzaSyClbltMzkM_4iEACl3DzyFmEcMtgwSVC58",
    authDomain: "adelina-88635.firebaseapp.com",
    databaseURL: "https://adelina-88635-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "adelina-88635",
    storageBucket: "adelina-88635.firebasestorage.app",
    messagingSenderId: "243523543489",
    appId: "1:243523543489:web:bb6c7c14e4c38e28648f40",
    measurementId: "G-6WJSXE9KXF"
};

const calendarDays = document.querySelector(".calendar-days");
const calendarDates = document.querySelector(".calendar-dates");
const currentMonthYear = document.getElementById("currentMonthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const resultContainer = document.getElementById("resultContainer");
const numberOfPeopleSelect = document.getElementById("numberOfPeople");

const daysOfWeek = ["Zon", "Ma", "Din", "Woe", "Don", "Vrij", "Zat"];
    let date = new Date();
    let previousStartDate = null;
    let previousEndDate = null;
    let numberOfPeople = 1;

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const database = getDatabase(app);


async function fetchBlockedDates() {
    try {
        // Create a reference to the "blockedPeriods" node
        const blockedPeriodsRef = ref(database, "blockedPeriods");

        // Fetch the data from Firebase
        const snapshot = await get(blockedPeriodsRef);

        // Process the data if it exists
        blockedDates = snapshot.exists()
            ? Object.values(snapshot.val()).map(period => ({
                  start: new Date(period.start),
                  end: new Date(period.end),
              }))
            : [];
              console.log(blockedDates);
        // Re-render the calendar after fetching data
        renderCalendar();
    } catch (error) {
        console.error("Error fetching blocked dates from Firebase:", error);
    }
}

const auth = getAuth();
signInAnonymously(auth)
    .then(() => {
        console.log("User signed in anonymously.");
        // After authentication, proceed with saving data
    })
    .catch((error) => {
        console.error("Error signing in anonymously:", error);
        alert("Authentication failed. Please try again.");
    });

function isDateBlocked(currentDate) {
    const normalizeDate = (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const normalizedCurrentDate = normalizeDate(currentDate);

    return blockedDates.some(period => {
        const normalizedStart = normalizeDate(period.start);
        const normalizedEnd = normalizeDate(period.end);

        return (
            normalizedCurrentDate >= normalizedStart &&
            normalizedCurrentDate <= normalizedEnd
        );
    });
}

document.addEventListener("DOMContentLoaded", function () {

    
    fetchBlockedDates();
    // Update number of people when dropdown changes
    numberOfPeopleSelect.addEventListener("change", function () {
        numberOfPeople = parseInt(this.value);
        if (selectedStartDate && selectedEndDate) {
            calculateAmount();
        }
    });

    // Initial render
    renderCalendar();
});

    // Preserve the current selected start and end dates
function renderCalendar() {
    calendarDays.innerHTML = "";
    calendarDates.innerHTML = "";

    // Set month and year in header
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    currentMonthYear.textContent = `${month} ${year}`;

    // Add days of the week
    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = day;
        calendarDays.appendChild(dayDiv);
    });

    // Calculate the first day of the current month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDay = firstDayOfMonth.getDay();

    // Calculate the total days in the current month
    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Calculate days from the previous month to fill empty spots
    const prevMonthDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const dateDiv = document.createElement("div");
        dateDiv.textContent = prevMonthDays - i;
        dateDiv.style.opacity = "0.5";
        calendarDates.appendChild(dateDiv);
    }

    // Add days of the current month
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
        const dateDiv = document.createElement("div");
        dateDiv.textContent = i;

        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);

        // Highlight today's date
        if (
            i === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            dateDiv.classList.add("today");
        }

        if (isDateBlocked(currentDate)) {
            const currentDateOnly = new Date(currentDate.setHours(0, 0, 0, 0));

            const blockedPeriod = blockedDates.find(period => {
                const periodStartOnly = new Date(period.start.setHours(0, 0, 0, 0));
                const periodEndOnly = new Date(period.end.setHours(0, 0, 0, 0));
                return currentDateOnly >= periodStartOnly && currentDateOnly <= periodEndOnly;
            });

            if (
                blockedPeriod &&
                (currentDate.getTime() === blockedPeriod.start.getTime() ||
                    currentDate.getTime() === blockedPeriod.end.getTime())
            ) {
                // Partial availability for the start and end of the blocked range
                dateDiv.classList.add("partial-available");
                dateDiv.innerHTML = `<span>${currentDate.getDate()}</span>`;
                dateDiv.addEventListener("click", () => selectDate(currentDate, dateDiv));
            } else {
                // Fully blocked dates
                dateDiv.style.opacity = "0.5";
                dateDiv.style.pointerEvents = "none";
                dateDiv.style.backgroundColor = "red";
                dateDiv.style.color = "white";
            }
        } else {
            // Enable selection for other dates
            dateDiv.addEventListener("click", () => selectDate(currentDate, dateDiv));
        }

        // Check if the date is selected or in the range
        if (selectedStartDate && selectedEndDate) {
            const divDate = new Date(date.getFullYear(), date.getMonth(), i);
            if (divDate.getTime() === selectedStartDate.getTime() || divDate.getTime() === selectedEndDate.getTime()) {
                dateDiv.classList.add("selected");
            }
            if (divDate > selectedStartDate && divDate < selectedEndDate) {
                dateDiv.classList.add("in-range");
            }
        }

        calendarDates.appendChild(dateDiv);
    }

    // Ensure the result container is only updated when the date range changes
    if (selectedStartDate && selectedEndDate && (selectedStartDate !== previousStartDate || selectedEndDate !== previousEndDate)) {
        calculateAmount();
        // Update the stored dates
        previousStartDate = selectedStartDate;
        previousEndDate = selectedEndDate;
    }
}

// Function to handle date selection
function selectDate(selectedDate, dateDiv) {
    // Helper function to check if the selected range contains any blocked dates
    function hasBlockedDatesInRange(start, end) {
        let currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate < end) {
            if (
                blockedDates.some(blockedPeriod =>
                    currentDate >= blockedPeriod.start && currentDate <= blockedPeriod.end
                )
            ) {
                return true;
            }
            currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
        }
        return false;
    }

    // Show or hide the warning message
    function showWarningMessage() {
        const warningMessage = document.getElementById("warningMessage");
        warningMessage.style.display = "block"; // Show warning
        warningMessage.innerHTML = `<p><strong>Waarschuwing:</strong> De geselecteerde periode bevat geblokkeerde data. Kies een andere periode.</p>`;
        let existingButton = document.getElementById("saveDatesButton");
        if (existingButton) {
            existingButton.remove();
        }
    }

    function hideWarningMessage() {
        const warningMessage = document.getElementById("warningMessage");
        warningMessage.style.display = "none"; // Hide warning
    }

    // Handle the logic for selecting start and end dates
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Reset selection if no start date is set or both dates are already selected
        selectedStartDate = selectedDate;
        selectedEndDate = null;
        document.querySelectorAll(".calendar-dates div").forEach(div => {
            div.classList.remove("selected");
            div.classList.remove("in-range");
        });
        dateDiv.classList.add("selected");
    } else if (!selectedEndDate && selectedDate > selectedStartDate) {
        // Select the end date if it's after the start date
        selectedEndDate = selectedDate;
        document.querySelectorAll(".calendar-dates div").forEach(div => {
            const day = parseInt(div.textContent);
            const divDate = new Date(date.getFullYear(), date.getMonth(), day);
            if (divDate >= selectedStartDate && divDate <= selectedEndDate) {
                div.classList.add("in-range");
            }
        });

        // Check if the selected range includes blocked dates
        if (hasBlockedDatesInRange(selectedStartDate, selectedEndDate)) {
            showWarningMessage(); // Show warning and reset selection
            selectedStartDate = null;
            selectedEndDate = null;
            document.querySelectorAll(".calendar-dates div").forEach(div => {
                div.classList.remove("selected");
                div.classList.remove("in-range");
            });
        } else {
            hideWarningMessage(); // Hide warning if the range is valid
            dateDiv.classList.add("selected");
            calculateAmount(); // Call calculateAmount after a valid range is selected
        }
    } else if (selectedDate < selectedStartDate) {
        // Allow re-selecting the start date
        selectedStartDate = selectedDate;
        selectedEndDate = null;
        document.querySelectorAll(".calendar-dates div").forEach(div => {
            div.classList.remove("selected");
            div.classList.remove("in-range");
        });
        dateDiv.classList.add("selected");
    }

    // Only call calculateAmount if both dates are selected and the range is valid
    if (selectedStartDate && selectedEndDate && !hasBlockedDatesInRange(selectedStartDate, selectedEndDate)) {
        calculateAmount();
    }
}
    
    // Constants for season rates
    const LOW_SEASON_RATE = 65;
    const MID_SEASON_RATE = 75;
    const HIGH_SEASON_RATE = 85;

// Function to calculate the amount
function calculateAmount() {
    if (!selectedStartDate || !selectedEndDate) return;

    const year = selectedStartDate.getFullYear();
    const nextYear = year + 1;

    // Correcte high season datums
    const highSeasonOneStart = new Date(year, 6, 1); // 1 juli
    const highSeasonOneEnd = new Date(year, 7, 31); // 31 augustus
    const highSeasonTwoStart = new Date(year, 11, 24); // 24 december
    const highSeasonTwoEnd = new Date(nextYear, 0, 7); // 7 januari (volgend jaar)

    // Correcte mid season datums
    const midSeasonOneStart = new Date(year, 4, 1); // 1 mei
    const midSeasonOneEnd = new Date(year, 5, 30); // 30 juni
    const midSeasonTwoStart = new Date(year, 8, 1); // 1 september
    const midSeasonTwoEnd = new Date(year, 9, 31); // 31 oktober

    // Correcte low season datums
    const lowSeasonOneStart = new Date(year, 0, 8); // 8 januari
    const lowSeasonOneEnd = new Date(year, 3, 30); // 30 april
    const lowSeasonTwoStart = new Date(year, 10, 1); // 1 november
    const lowSeasonTwoEnd = new Date(year, 11, 23); // 23 december

    let totalDays = 0;
    let lowSeasonDays = 0;
    let midSeasonDays = 0;
    let highSeasonDays = 0;

    for (
        let d = new Date(selectedStartDate);
        d < selectedEndDate;
        d.setDate(d.getDate() + 1)
    ) {
        totalDays++;

        if (
            (d >= highSeasonOneStart && d <= highSeasonOneEnd) ||
            (d >= highSeasonTwoStart && d <= highSeasonTwoEnd)
        ) {
            highSeasonDays++;
        } else if (
            (d >= midSeasonOneStart && d <= midSeasonOneEnd) ||
            (d >= midSeasonTwoStart && d <= midSeasonTwoEnd)
        ) {
            midSeasonDays++;
        } else if (
            (d >= lowSeasonOneStart && d <= lowSeasonOneEnd) ||
            (d >= lowSeasonTwoStart && d <= lowSeasonTwoEnd)
        ) {
            lowSeasonDays++;
        }
    }

    let lowSeasonAmount = lowSeasonDays * LOW_SEASON_RATE;
    let midSeasonAmount = midSeasonDays * MID_SEASON_RATE;
    let highSeasonAmount = highSeasonDays * HIGH_SEASON_RATE;
    let totalAmount = lowSeasonAmount + midSeasonAmount + highSeasonAmount;

    if (totalDays >= 15) {
        totalAmount *= 0.90; // 10% korting op alles
    }

    // Update total amount based on number of people
    const resultContainer = document.getElementById('resultContainer');

    // Function to make the element visible
    function showResultContainer() {
        resultContainer.style.visibility = 'visible';
    }
    showResultContainer();
    resultContainer.innerHTML = `
                                <p><strong>Geselecteerde periode:</strong> ${selectedStartDate.toLocaleDateString()} tot ${selectedEndDate.toLocaleDateString()} (${totalDays} dagen).</p>
                                <p><strong>Totaal bedrag:</strong> €${totalAmount.toFixed(2)}</p>
                                <p><strong>Hier komt nog een waarborg bij van:</strong> €300</p>
                                <p><strong>Eind schoonmaak:</strong> €70</p>
                                <p><strong>Bed en bad linnen:</strong> €7,5 per persoon</p>
                                <p class="highlight">Prijs = €${(totalAmount + 300 + 70 + (7.5 * numberOfPeople)).toFixed(2)}</p>
                                `;
}

    // Event listeners for navigation
    prevMonth.addEventListener("click", () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener("click", () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

//explenation of discount and seasons
const discountSeasonContainer = document.getElementById("discountSeasonContainer");

const discountInfoHTML = `
    <div class="discount-seasons">
        <div class="season">
            <p><strong>Laagseizoen:</strong></p>
            <p>€65/dag</p>
        </div>
        <div class="season">
            <p><strong>Middenseizoen:</strong></p>
            <p>€75/dag</p>
        </div>
        <div class="season">
            <p><strong>Hoogseizoen:</strong></p>
            <p>€85/dag</p>
        </div>
    </div>
    <p>10% korting vanaf 15 dagen</p>
    <p>voor overwinteraars (vanaf 4 weken) word een apart tarief verekend dit enkel in het laagseizoen neem hiervoor contact met ons op</p>
    <div class="info-icon-container">
        <img src="../symbols/info_Icon.png" alt="Info" class="info-icon"/>
            <div class="info-tooltip">
                <div class="season">
                    <p><strong>Laagseizoen:</strong></p>
                    <p>jan,feb,mar, nov, dec</p>
                </div>
                <div class="season">
                    <p><strong>Middenseizoen:</strong></p>
                    <p>apr,mei, tot 15 jun, vanaf 15 sept, okt</p>
                </div>
                <div class="season">
                    <p><strong>Hoogseizoen:</strong></p>
                    <p>van 15 jun tot 15 sept en van 24 dec tot 7 jan</p>
                </div>
            </div>
    </div>
`;

discountSeasonContainer.innerHTML = discountInfoHTML;

//explenation for the calender
const explenationContainer = document.getElementById("explenationContainer");
explenationContainer.innerHTML = `
                                    <p><strong>Selecteer hier een datum om een prijs te bekomen:</strong> Kies een start- en einddatum uit de kalender hieronder om de prijs te berekenen voor de geselecteerde periode.</p>
                                    <br>
                                    <p><strong>Inchecken vanaf 15u en uitchecken om 11u</strong></p>
                                    <br>
                                    <p><strong>elektriciteit tot 15KW/dag hierna zal een extra kost aangerekend worden van 1€ per KW deze word afgetrokken van de waarborg.</strong></p>
                                    <br>
                                    <p><strong>huisdieren in overleg.</strong></p>
                                `;