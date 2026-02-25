package tn.esprit.equipmentservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.equipmentservice.entities.Equipment;
import tn.esprit.equipmentservice.services.EquipmentService;

import java.util.List;

@RestController
@RequestMapping("/equipments")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService service;

    @PostMapping
    public Equipment add(@RequestBody Equipment e) {
        return service.addEquipment(e);
    }

    @GetMapping
    public List<Equipment> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Equipment getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Equipment update(@PathVariable Long id, @RequestBody Equipment e) {
        return service.update(id, e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/room/{roomId}")
    public List<Equipment> getByRoom(@PathVariable Long roomId) {
        return service.getByRoom(roomId);
    }
}