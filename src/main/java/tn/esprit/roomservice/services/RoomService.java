package tn.esprit.roomservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.roomservice.entities.Room;
import tn.esprit.roomservice.repositories.RoomRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public Room createRoom(Room room) {
        room.setAvailable(true);
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id).orElseThrow();
    }

    public Room updateRoom(Long id, Room updatedRoom) {
        Room room = roomRepository.findById(id).orElseThrow();

        room.setName(updatedRoom.getName());
        room.setCapacity(updatedRoom.getCapacity());
        room.setEquipment(updatedRoom.getEquipment());
        room.setAvailable(updatedRoom.getAvailable());

        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}