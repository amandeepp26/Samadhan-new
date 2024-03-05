import {useEffect, useState} from 'react';
import {Searchbar} from 'react-native-paper';
import { Styles } from '../styles/styles';
import { View } from 'react-native';

const Search = ({query, data, setData, filterFunction}) => {
  const [searchQuery, setSearchQuery] = useState(query ? query : '');

  const onChangeText = text => setSearchQuery(text);

  useEffect(() => {
    let searchData = data;
    if (searchQuery?.trim()?.length > 0) {
      const filteredData = data?.filter(item => {
        let temp = false;
        filterFunction.forEach(it => {
          if (it === 'display') {
            const value = item[it] ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'view_status') {
            const value = item[it] === '1' ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'isApprove') {
            const value = item[it] === '1' ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'isPublish') {
            const value = item[it] === '1' ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'employee_active_status') {
            const value = item[it] === '1' ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'reportingAuthority') {
            const value = item[it] === '1' ? 'yes' : 'no';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (it === 'approve_status') {
            const value = item[it] === '1' ? 'Approved' : 'Not Approved';
            if (value?.includes(searchQuery?.trim()?.toLowerCase())) {
              temp = true;
              return;
            }
          } else if (
            item[it]
              ?.toString()
              .toLowerCase()
              ?.includes(searchQuery?.trim()?.toLowerCase())
          ) {
            temp = true;
            return;
          }
        });
        return temp;
      });
      setData(filteredData);
    } else {
      setData(searchData);
    }
  }, [searchQuery]);

  return (
    <Searchbar
      style={[
        Styles.margin16,
        {
          borderWidth: 1,
          borderColor: '#d3d3d3',
          width:'90%',
          backgroundColor: '#fff',
          color: '#000',
          alignSelf: 'center',
          borderRadius: 20,
          marginTop: 10,
        },
      ]}
      placeholder="Search"
      onChangeText={onChangeText}
      value={searchQuery}
    />
  );
};

export default Search;
