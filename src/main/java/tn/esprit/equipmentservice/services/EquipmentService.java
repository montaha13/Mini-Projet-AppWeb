package tn.esprit.equipmentservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.equipmentservice.entities.Equipment;
import tn.esprit.equipmentservice.repositories.EquipmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository repository;

    public Equipment addEquipment(Equipment e) {
        return repository.save(e);
    }

    public List<Equipment> getAll() {
        return repository.findAll();
    }

    public Equipment getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    public Equipment update(Long id, Equipment e) {
        Equipment existing = getById(id);
        existing.setName(e.getName());
        existing.setDescription(e.getDescription());
        existing.setAvailable(e.isAvailable());
        existing.setRoomId(e.getRoomId());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Equipment> getByRoom(Long roomId) {
        return repository.findByRoomId(roomId);
    }
}