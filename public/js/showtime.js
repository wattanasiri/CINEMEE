const seats = document.querySelectorAll(".row-showtime .seat:not(.occupied)");
const seatContainer = document.querySelector(".row-container");
const count = document.getElementById("count");
const total = document.getElementById("total");

let ticketPrice = 120;

function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll(".row-container .selected");
  if(selectedSeats.length > 0){
    document.getElementById("buyTicket").disabled = false;
  }else{
    document.getElementById("buyTicket").disabled = true;
  }
  let selectedSeatsCount = selectedSeats.length;
  count.textContent = selectedSeatsCount;
  total.textContent = selectedSeatsCount * ticketPrice;
}

seatContainer.addEventListener("click", function(seat){
  if (seat.target.classList.contains("seat") && !seat.target.classList.contains("occupied")){
    seat.target.classList.toggle("selected");
    updateSelectedCount();
  }
});

updateSelectedCount();