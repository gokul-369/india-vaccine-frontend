import { GetServerSideProps, NextPageContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useAPIRequest } from "../api";
import { components } from "../api/interfaces";
import { cleanObj, isEmpty } from "../helpers";
import { isNum } from "../helpers";

import CvcCard from "../components/cvc_card";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

import styles from "../styles/availability_results.module.css";
import { useState } from "react";
import { Districts } from "../api/district";

export default function AvailabilityResults(context: NextPageContext) {
  const { query, push } = useRouter();

  //for searching/editing new state/pincode *STARTS*
  const [searchBarContent, setSearchBarContent] = useState<string>(query?.pincode?.toString() ?? query.district?.toString())
  const showNewResults = () => {
    if (!searchBarContent) {
      return "Input is null";
    }

    if (searchBarContent.length === 0) {
      return "Input is empty";
    }

    if (isNum(searchBarContent)) {
      push({
        pathname: "/availability_results",
        query: {
          pincode: searchBarContent,
        },
      });
    } else {
      push({
        pathname: "/availability_results",
        query: {
          district: searchBarContent,
        },
      });
    }
  };
  //for searching/editing new state/pincode *ENDS*

  let APIQuery = {
    pincode: Number(query?.pincode),
    district: query?.district,
  };

  // console.log(APIQuery)

  const { data, error } = useAPIRequest<
    components["schemas"]["PaginatedCVCData"]
  >({
    url: "v1/cvc",
    method: "post",
    data: APIQuery,
  });
  console.log(data);
  return (
    <div>
      <Head>
        <title>India Vaccine - Results</title>
      </Head>
      <Navbar />
      <div className={styles.container}>
        <main className={styles.main}>
          <h3 className="textCenter">
            {" "}
            Showing {error && <span>0</span>}
            {!data && <span>Unknown</span>}
            {data && data.results.length} Vaccination Centers
          </h3>
          <div className="flex mobileCol center">
            <label className={styles.label}>
            <input
              list="districts"
              onChange={(e) => setSearchBarContent(e.target.value)}
              type="text"
              className={styles.searchBar}
              placeholder="Enter your Pincode or District name"
              value={searchBarContent}
            />
            <datalist id="districts">
              {Districts.map((district) => {
                return <option value={district.district_name} />;
              })}
            </datalist>
            </label>
            <button
            onClick={showNewResults}
            type="submit"
            className={styles.searchButton}
          >
            Find Vaccine
          </button>
          </div>
        </main>
        {error && <div>Failed to Load</div>}
        {!data && <div>Loading Data...</div>}
        {data && (
          <div className={styles.results}>
            {data.results.map((e) => (
              <CvcCard key={e.cowin_center_id} data={e} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;

  /**
   * If no query params are present go
   * to the search page
   */
  if (isEmpty(query)) {
    return {
      redirect: {
        destination: "/check_availability",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};