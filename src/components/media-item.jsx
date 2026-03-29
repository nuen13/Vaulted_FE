import React from 'react';
import { Row, Col } from "react-bootstrap";






const MediaItem = ({ data }) => {
    return (
        <>

            {/* change bg color depend on the Category */}
            <Row>
                <Col xs={12} md={2}>
                    <img src={data?.coverPhotoUrl} alt={data?.mediaTitle} className="img-fluid" />
                </Col>
                <Col xs={12} md={10}>
                    <div>
                        <span style={{ marginLeft: "10px", color: "#ca0000" }}>{data?.mediaCategory}
                            
                            <b>{data?.mediaTitle}</b>
                        
                        </span>
                    </div>
                    <div>
                    </div>
                    <div>
                        {data?.mediaType}
                    </div>
                </Col>
            </Row>


        </>
    );
};


export default MediaItem;