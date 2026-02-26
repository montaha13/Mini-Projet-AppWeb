package tn.esprit.reservationservice.reservationservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import tn.esprit.reservationservice.reservationservice.entities.Reservation;
import tn.esprit.reservationservice.reservationservice.entities.ReservationStatus;
import tn.esprit.reservationservice.reservationservice.repositories.ReservationRepository;


import java.time.LocalDateTime;
@SpringBootApplication
@EnableDiscoveryClient
public class ReservationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservationServiceApplication.class, args);
    }

    @Autowired
    private ReservationRepository reservationRepository;

    // Initialiser quelques réservations à la création de l'application
    @Bean
    ApplicationRunner init() {
        return args -> {
            if (reservationRepository.count() == 0) {
                reservationRepository.save(new Reservation(
                        null,
                        1L, // userId
                        101L, // roomId
                        LocalDateTime.of(2026, 2, 15, 10, 0),
                        LocalDateTime.of(2026, 2, 15, 12, 0),
                        ReservationStatus.ACTIVE
                ));
                reservationRepository.save(new Reservation(
                        null,
                        2L,
                        102L,
                        LocalDateTime.of(2026, 2, 16, 14, 0),
                        LocalDateTime.of(2026, 2, 16, 16, 0),
                        ReservationStatus.ACTIVE
                ));
                reservationRepository.save(new Reservation(
                        null,
                        3L,
                        103L,
                        LocalDateTime.of(2026, 2, 17, 9, 0),
                        LocalDateTime.of(2026, 2, 17, 11, 0),
                        ReservationStatus.ACTIVE
                ));
            }
        };
    }
}
