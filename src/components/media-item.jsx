import React from 'react';
import {Row, Col} from "react-bootstrap";


const MediaItem = ({data}) => {
    return (
        <>
            <Row>
                <Col xs={12} md={2}>
                    <img src = {data?.coverPhotoUrl} alt = {data?.mediaTitle} className = "img-fluid" />
                </Col>
                <Col xs={12} md={10}>
                    <div>
                        <b>{data?.mediaTitle}</b>
                    </div>
                    <div>
                        {data?.mediaType}
    

                        
                    </div>

                    <Col>
                        <hr />
                    </Col>
                </Col>
            </Row>
        </>
    );
};


export default MediaItem;