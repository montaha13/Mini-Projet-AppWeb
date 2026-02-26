package tn.esprit.reservationservice.reservationservice.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.reservationservice.reservationservice.entities.Reservation;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByRoomId(Long roomId);
}
