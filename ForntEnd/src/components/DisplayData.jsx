import React from 'react';

const DisplayData = ({ data }) => {
  return (
    <div className="container">
      <div className="row">
        {data.map((item) => (
          <div key={item.guid} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.pubDate}</p>
                <a href={item.link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayData;
