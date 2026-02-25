package tn.esprit.roomservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.roomservice.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}