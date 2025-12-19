import { useEffect, useState } from "react";
import { Select, Card, Modal, Input, message, Row, Col, Upload, Button } from "antd";
import { Html5Qrcode } from "html5-qrcode";
import { UploadOutlined } from "@ant-design/icons";
import { getPublicHotels } from "../api/hotelApi";
import { getRoomsByHotel, openDoor } from "../api/doorApi";

export default function DoorPage() {
    const [hotels, setHotels] = useState([]);
    const [hotelId, setHotelId] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [qrToken, setQrToken] = useState("");
    const [open, setOpen] = useState(false);

    // load khách sạn
    useEffect(() => {
        getPublicHotels()
            .then(res => setHotels(res.data.data))
            .catch(() => message.error("Không tải được khách sạn"));
    }, []);

    // load phòng khi chọn KS
    useEffect(() => {
        if (!hotelId) return;

        getRoomsByHotel(hotelId)
            .then(res => setRooms(res.data))
            .catch(() => message.error("Không tải được phòng"));
    }, [hotelId]);

    const handleQrImage = async (file) => {
        const html5QrCode = new Html5Qrcode("qr-temp");

        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            setQrToken(decodedText);
            message.success("Đã đọc QR thành công");
        } catch (err) {
            message.error("Không đọc được QR");
        }

        return false; // chặn upload
    };

    const handleOpenDoor = async () => {
        if (!qrToken) {
            message.warning("Nhập QR token");
            return;
        }

        try {
            await openDoor(selectedRoom.id, qrToken);
            message.success("✅ Mở cửa thành công");
            setOpen(false);
            setQrToken("");
        } catch (e) {
            message.error(e.response?.data?.message || "❌ Mở cửa thất bại");
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <div id="qr-temp" style={{ display: "none" }} />
            <h2>MỞ CỬA PHÒNG</h2>

            {/* Dropdown khách sạn */}
            <Select
                style={{ width: 300, marginBottom: 24 }}
                placeholder="Chọn khách sạn"
                onChange={setHotelId}
                options={hotels.map(h => ({
                    value: h.id,
                    label: h.tenKhachSan,
                }))}
            />

            {/* Grid phòng */}
            <Row gutter={[16, 16]}>
                {rooms.map(room => (
                    <Col key={room.id} xs={12} sm={8} md={6}>
                        <Card
                            hoverable
                            onClick={() => {
                                setSelectedRoom(room);
                                setOpen(true);
                            }}
                        >
                            <h3>Phòng {room.soPhong}</h3>
                            <p>Trạng thái: {room.trangThaiPhong}</p>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal nhập QR */}
            <Modal
                open={open}
                title={`Mở cửa phòng ${selectedRoom?.soPhong}`}
                onOk={handleOpenDoor}
                onCancel={() => setOpen(false)}
                okText="Mở cửa"
            >
                <Upload
                    accept="image/png,image/jpeg"
                    showUploadList={false}
                    beforeUpload={handleQrImage}
                >
                    <Button icon={<UploadOutlined />}>
                        Tải ảnh QR
                    </Button>
                </Upload>
            </Modal>
        </div>
    );
}
