package tn.esprit.reservationservice.reservationservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.reservationservice.reservationservice.entities.Reservation;
import tn.esprit.reservationservice.reservationservice.entities.ReservationStatus;
import tn.esprit.reservationservice.reservationservice.repositories.ReservationRepository;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public Reservation createReservation(Reservation reservation) {
        reservation.setStatus(ReservationStatus.ACTIVE);
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public Reservation cancelReservation(Long id) {
        Reservation r = reservationRepository.findById(id).orElseThrow();
        r.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(r);
    }
}
