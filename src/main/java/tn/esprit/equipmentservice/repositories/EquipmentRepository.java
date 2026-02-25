package tn.esprit.equipmentservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.equipmentservice.entities.Equipment;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByRoomId(Long roomId);
}